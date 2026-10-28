param([switch]$Development)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) { $nodePath = $nodeCommand.Source } else {
  $nodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (!(Test-Path -LiteralPath $nodePath)) { throw 'Install Node.js 20.19 or newer, then try again.' }
}
if (!(Test-Path -LiteralPath 'node_modules')) { throw 'Run npm ci first.' }
if ($Development) {
  & $nodePath node_modules/concurrently/dist/bin/concurrently.js -k "`"$nodePath`" --watch server/index.js" "`"$nodePath`" node_modules/vite/bin/vite.js --host 127.0.0.1"
} else {
  & $nodePath node_modules/vite/bin/vite.js build
  if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
  Write-Host 'Open http://127.0.0.1:4100 after the API is ready.' -ForegroundColor Green
  & $nodePath server/index.js
}
