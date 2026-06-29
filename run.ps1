# Deadline Rescue Agent - Local Dev Startup Script
param(
    [switch]$Install,
    [switch]$Build,
    [switch]$Start,
    [switch]$All
)

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $RootDir ".env"

# Load .env
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^(.*?)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

function Install-Deps {
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
    & "$RootDir\.venv\Scripts\pip" install -r "$RootDir\requirements.txt"
    
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location "$RootDir\frontend"
    npm install
    Pop-Location
}

function Build-Frontend {
    Write-Host "🏗️ Building frontend..." -ForegroundColor Cyan
    Push-Location "$RootDir\frontend"
    npx vite build
    Pop-Location
    Write-Host "✅ Frontend built to dist/" -ForegroundColor Green
}

function Start-Server {
    Write-Host "🚀 Starting Deadline Rescue Agent..." -ForegroundColor Cyan
    Write-Host "🌐 Open http://localhost:8000 in your browser" -ForegroundColor Yellow
    
    & "$RootDir\.venv\Scripts\uvicorn" backend.main:app --host 0.0.0.0 --port 8000 --reload
}

if ($Install -or $All) { Install-Deps }
if ($Build -or $All) { Build-Frontend }
if ($Start -or $All -or (-not $Install -and -not $Build)) { Start-Server }