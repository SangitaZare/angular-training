param(
	[string]$RemoteUrl = "https://github.com/SangitaZare/angular-trainning.git",
	[string]$LocalProjectPath = (Get-Location).Path,
	[string]$CloneDir = (Join-Path (Split-Path -Parent (Get-Location).Path) "angular-trainning-clone"),
	[string]$BranchName = "add-productapi"
)

Write-Host "Remote URL: $RemoteUrl"
Write-Host "Local project path: $LocalProjectPath"
Write-Host "Clone target: $CloneDir"
Write-Host "Branch to create: $BranchName"

# Check git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
	Write-Error "Git is not installed or not on PATH. Install Git from https://git-scm.com/ and retry."
	exit 1
}

# Confirm clone directory
if (Test-Path $CloneDir) {
	$resp = Read-Host "Clone directory '$CloneDir' already exists. Overwrite (Y) / Abort (N)? [N]"
	if ($resp -ne 'Y' -and $resp -ne 'y') {
		Write-Host "Aborted by user. If you want to use the existing folder, run the script again with a different -CloneDir."; exit 1
	}
	Remove-Item -Recurse -Force $CloneDir
}

# Clone remote
Write-Host "Cloning $RemoteUrl -> $CloneDir"
$cloneExit = git clone $RemoteUrl $CloneDir
if ($LASTEXITCODE -ne 0) { Write-Error "git clone failed."; exit 1 }

# Copy project into cloned repo
$targetProductDir = Join-Path $CloneDir "ProductApi"
Write-Host "Copying project from '$LocalProjectPath' to '$targetProductDir' (excludes .git, bin, obj, .vs)"
robocopy "$LocalProjectPath" "$targetProductDir" /E /XD ".git" "bin" "obj" ".vs" ".idea" /XF "*.user" "*.suo" | Out-Null

# Add VisualStudio .gitignore if missing
Set-Location $CloneDir
if (-not (Test-Path .gitignore)) {
	Write-Host "Downloading VisualStudio .gitignore"
	try {
		Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/github/gitignore/main/VisualStudio.gitignore' -OutFile .gitignore -UseBasicParsing -ErrorAction Stop
	} catch {
		Write-Warning "Failed to download .gitignore. You can add one manually later."
	}
}

# Create branch, commit, push
Write-Host "Creating branch '$BranchName' and committing changes"
# Create branch
git switch -c $BranchName 2>$null
if ($LASTEXITCODE -ne 0) {
	# fallback for older git
	git checkout -b $BranchName
	if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create branch $BranchName"; exit 1 }
}

# Stage changes
git add .

# Check if there is anything to commit
$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
	Write-Host "No changes to commit in clone. Exiting."
	exit 0
}

# Commit
git commit -m "Add ProductApi .NET 10 solution"
if ($LASTEXITCODE -ne 0) { Write-Error "git commit failed."; exit 1 }

# Push
Write-Host "Pushing branch to origin ($BranchName). You will be prompted for GitHub credentials if required. For HTTPS use your username and a Personal Access Token as password."
git push -u origin $BranchName
if ($LASTEXITCODE -ne 0) { Write-Error "git push failed."; exit 1 }

Write-Host "Push completed. Open Pull Request from branch '$BranchName' into 'main' at:"
Write-Host "$($RemoteUrl -replace '\.git$','')/compare/main...$BranchName"
Write-Host "Done."
