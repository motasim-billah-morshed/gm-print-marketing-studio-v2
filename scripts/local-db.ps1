param([ValidateSet('init','start','stop')][string]$Action='start')
$ErrorActionPreference='Stop'
$repoPath=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoPath
$binPath=Join-Path $repoPath '.local-tools/postgres/pgsql/bin'
$dataPath=Join-Path $repoPath '.private/pgdata'
if(!(Test-Path (Join-Path $binPath 'pg_ctl.exe'))){throw 'Download PostgreSQL Windows binaries into .local-tools/postgres/pgsql, or use your own PostgreSQL and .env.'}
if($Action -eq 'init') {
 if((Test-Path '.env') -or (Test-Path $dataPath)){throw 'Existing configuration/database found; init refuses to overwrite.'}
 New-Item -ItemType Directory -Force '.private' | Out-Null
 function New-LocalSecret { $bytes=New-Object byte[] 36; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); return [Convert]::ToBase64String($bytes).Replace('+','x').Replace('/','y').Replace('=','') }
 $ownerSecret=New-LocalSecret
 $appSecret=New-LocalSecret
 $sessionSecret=New-LocalSecret
 $seedSecret=New-LocalSecret
 Set-Content -LiteralPath '.private/pg-password' -Value $ownerSecret -NoNewline
 & "$binPath/initdb.exe" -D $dataPath -U postgres '--auth=scram-sha-256' '--encoding=UTF8' '--locale=C' '--pwfile=.private/pg-password'
 if($LASTEXITCODE -ne 0){throw 'initdb failed'}
 Add-Content -LiteralPath "$dataPath/postgresql.conf" -Value "`nlisten_addresses='127.0.0.1'`nport=55433"
 & "$binPath/pg_ctl.exe" -D $dataPath -l "$repoPath/.private/postgres.log" -w start
 if($LASTEXITCODE -ne 0){throw 'PostgreSQL start failed'}
 $env:PGPASSWORD=$ownerSecret
 try {
  & "$binPath/psql.exe" -h 127.0.0.1 -p 55433 -U postgres -d postgres -v ON_ERROR_STOP=1 -c "CREATE ROLE gm_app LOGIN PASSWORD '$appSecret';"
  & "$binPath/createdb.exe" -h 127.0.0.1 -p 55433 -U postgres gm_d3
 } finally {Remove-Item Env:PGPASSWORD}
 @"
DATABASE_URL=postgresql://gm_app:$appSecret@127.0.0.1:55433/gm_d3
MIGRATION_DATABASE_URL=postgresql://postgres:$ownerSecret@127.0.0.1:55433/gm_d3
SESSION_SECRET=$sessionSecret
APP_ORIGIN=http://127.0.0.1:4183
PORT=4183
PRIVATE_DIR=.private/uploads
NODE_ENV=development
SEED_PASSWORD=$seedSecret
"@ | Set-Content -LiteralPath '.env'
 Write-Output 'Local PostgreSQL initialized. Private credentials are in ignored .env; never commit/share it.'
} elseif($Action -eq 'start') {
 & "$binPath/pg_ctl.exe" -D $dataPath -l "$repoPath/.private/postgres.log" -w start
} else { & "$binPath/pg_ctl.exe" -D $dataPath -m fast -w stop }
