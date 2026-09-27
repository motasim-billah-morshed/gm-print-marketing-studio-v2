import {parseFile} from './parser.js';
process.on('message',async(message:any)=>{try {process.send?.({sheets:await parseFile(message.path,message.kind)});}catch(e){process.send?.({error:e instanceof Error?e.message:'Parse failed'});}finally{process.disconnect?.();}});
