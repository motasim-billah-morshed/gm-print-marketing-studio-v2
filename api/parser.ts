import fs from 'node:fs/promises';
import {parse} from 'csv-parse/sync';
import ExcelJS from 'exceljs';
import yauzl from 'yauzl';
export type Sheet = {name:string;headers:string[];rows:Record<string,string>[];warnings:Record<number,string>};
export async function parseFile(path:string,kind:string):Promise<Sheet[]> {
 const bytes=await fs.readFile(path); if(bytes.length>5*1024*1024)throw Error('File exceeds 5 MB');
 if(kind==='csv') {
  let encoding='utf-8';if(bytes[0]===255&&bytes[1]===254)encoding='utf-16le';if(bytes[0]===254&&bytes[1]===255)encoding='utf-16be';
  const csv=new TextDecoder(encoding,{fatal:true}).decode(bytes).replace(/^\uFEFF/,'');
  const matrix=parse(csv,{bom:true,skip_empty_lines:true,relax_column_count:false,max_record_size:100000}) as string[][];
  return [sheet('CSV',matrix,{})];
 }
 if(kind!=='xlsx'||bytes[0]!==80||bytes[1]!==75)throw Error('Only CSV and XLSX files are supported');
 await new Promise<void>((resolve,reject)=>yauzl.open(path,{lazyEntries:true},(err,zip)=>{
  if(err||!zip)return reject(err);let size=0,count=0;
  zip.on('error',reject);zip.on('end',resolve);zip.on('entry',e=>{size+=e.uncompressedSize;count++;if(size>50*1024*1024||count>1000){zip.close();reject(Error('Archive expansion limit exceeded'));}else zip.readEntry();});zip.readEntry();
 }));
 const book=new ExcelJS.Workbook();await book.xlsx.readFile(path);
 if(book.worksheets.length>20)throw Error('Maximum 20 sheets');
 return book.worksheets.map(ws=>{
  if(ws.rowCount>10001||ws.columnCount>50)throw Error('Maximum 10,000 data rows and 50 columns');
  const matrix:string[][]=[],warnings:Record<number,string>={};
  for(let i=1;i<=ws.rowCount;i++) {
   const cells=[];
   for(let j=1;j<=ws.columnCount;j++) {
    const cell=ws.getRow(i).getCell(j);
    if(cell.type===ExcelJS.ValueType.Formula)warnings[i]='Formula cells are not accepted';
    const value=cell.value;
    // Numeric cells may already have lost leading zero: never reconstruct numbers.
    if(typeof value==='number')warnings[i]=(warnings[i]||'')+' Numeric cell: confirm phone/identifier precision';
    cells.push(value==null?'':typeof value==='object'&&'formula' in value?'[FORMULA]':cell.text);
   }
   matrix.push(cells);
  }
  return sheet(ws.name,matrix,warnings);
 });
}
function sheet(name:string,matrix:string[][],warnings:Record<number,string>):Sheet {
 if(matrix.length>10001||matrix.some(r=>r.length>50))throw Error('Maximum 10,000 rows and 50 columns');
 const headers=matrix.shift()?.map(h=>h.trim());
 if(!headers?.length||headers.some(h=>!h)||new Set(headers).size!==headers.length)throw Error('Unique nonempty column headers required');
 return {name,headers,rows:matrix.map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]||'']))),warnings};
}
