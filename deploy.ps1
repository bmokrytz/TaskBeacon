# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
$AWS_REGION     = "us-east-1"
$AWS_ACCOUNT    = "831889733424"
$ECR_REPO       = "taskbeacon"
$APP_RUNNER_ARN = "arn:aws:apprunner:us-east-1:831889733424:service/taskbeacon-api/73badc5ba5e44e4f990d502801b3e2d0"
$VERSION_FILE   = ".deploy_version"

# ─────────────────────────────────────────────
# Auto-increment version tag
# ─────────────────────────────────────────────
if (Test-Path $VERSION_FILE) {
    $lastVersion = Get-Content $VERSION_FILE
    $versionNum  = [int]($lastVersion -replace "v", "")
    $nextNum     = $versionNum + 1
} else {
    $nextNum = 1
}

$TAG       = "v$nextNum"
$ECR_IMAGE = "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/${ECR_REPO}:$TAG"

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "     TaskBeacon Deployment" -ForegroundColor Cyan
Write-Host "     Tag: $TAG" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Helper — stops the script and prints an error if a command fails
function Check-Error {
    param($step)
    if ($LASTEXITCODE -ne 0) {
        Write-Host "--> Failed at step: $step" -ForegroundColor Red
        exit 1
    }
}

# ─────────────────────────────────────────────
# Step 1 — Pull latest code
# ─────────────────────────────────────────────
Write-Host "--> [1/5] Pulling latest code from main..."
git pull origin main
Check-Error "git pull"
Write-Host "-->  Done."
Write-Host ""

# ─────────────────────────────────────────────
# Step 2 — Build Docker image
# ─────────────────────────────────────────────
Write-Host "--> [2/5] Building Docker image..."
docker build -t taskbeacon .
Check-Error "docker build"
Write-Host "-->  Done."
Write-Host ""

# ─────────────────────────────────────────────
# Step 3 — Login to ECR
# ─────────────────────────────────────────────
Write-Host "--> [3/5] Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | `
    docker login --username AWS --password-stdin `
    "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com"
Check-Error "ecr login"
Write-Host "-->  Done."
Write-Host ""

# ─────────────────────────────────────────────
# Step 4 — Tag and push image
# ─────────────────────────────────────────────
Write-Host "--> [4/5] Tagging and pushing image as $TAG..."
docker tag taskbeacon:latest $ECR_IMAGE
Check-Error "docker tag"
docker push $ECR_IMAGE
Check-Error "docker push"
Write-Host "-->  Done."
Write-Host ""

# ─────────────────────────────────────────────
# Step 5 — Update App Runner
# ─────────────────────────────────────────────
Write-Host "--> [5/5] Updating App Runner to $TAG..."
$sourceConfig = '{"ImageRepository":{"ImageIdentifier":"' + $ECR_IMAGE + '","ImageRepositoryType":"ECR"}}'
[System.IO.File]::WriteAllText("source_config.json", $sourceConfig)
aws apprunner update-service `
    --region $AWS_REGION `
    --service-arn $APP_RUNNER_ARN `
    --source-configuration file://source_config.json | Out-Null
Check-Error "apprunner update-service"
Remove-Item "source_config.json"
Write-Host "--> Done."
Write-Host ""

# ─────────────────────────────────────────────
# Save version for next deploy
# ─────────────────────────────────────────────
$TAG | Out-File -FilePath $VERSION_FILE -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Deployment triggered successfully!" -ForegroundColor Cyan
Write-Host "  Image : $ECR_IMAGE" -ForegroundColor Cyan
Write-Host "  Check : AWS Console → App Runner → Logs" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
