# PowerShell Microcommit Daemon for Windows
# Run in background: Start-Job -FilePath .\agent_autocommit.ps1

$watchDir = "."
$branch = "main"

Write-Host "Initializing Agentic Microcommit Daemon on directory: $watchDir..." -ForegroundColor Cyan

# Initialize git if not already
if (-not (Test-Path ".git")) {
    git init
    git checkout -b $branch
}

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = Resolve-Path $watchDir
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$debounce = @{}

Register-ObjectEvent $watcher "Changed" -Action {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -match "\\.git") { return }

    $debounceKey = $path
    if ($global:debounce.ContainsKey($debounceKey)) { return }
    $global:debounce[$debounceKey] = $true

    Start-Sleep -Seconds 3

    Write-Host "File change detected: $path" -ForegroundColor Yellow

    git add .
    $diff = git diff --cached

    if (-not [string]::IsNullOrEmpty($diff)) {
        Write-Host "Generating commit message..." -ForegroundColor Cyan
        $commitMsg = python generate_commit_msg.py $diff 2>$null
        if ([string]::IsNullOrEmpty($commitMsg)) {
            $commitMsg = "Auto-commit: Agent state mutation and file update"
        }
        git commit -m $commitMsg
        git push origin $branch --force 2>$null
        Write-Host "Microcommit: $commitMsg" -ForegroundColor Green
    }

    $global:debounce.Remove($debounceKey)
} | Out-Null

Write-Host "Microcommit daemon running. Press Ctrl+C to stop." -ForegroundColor Green

# Keep the script running
while ($true) {
    Start-Sleep -Seconds 10
}