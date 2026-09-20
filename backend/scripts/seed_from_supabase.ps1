<#
  Pulls a copy of the live Supabase database's data (public schema only)
  into the local Docker Postgres dev database.

  Run this manually whenever you want fresh local data — it is NOT run
  automatically on container startup, so local dev never depends on
  network access or live credentials just to start.

  Usage (from backend/):
      .\scripts\seed_from_supabase.ps1
#>

$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    throw ".env not found at $envPath"
}

$envVars = @{}
foreach ($line in Get-Content $envPath) {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $key, $value = $line -split '=', 2
    $envVars[$key.Trim()] = $value.Trim()
}

foreach ($required in @("SUPABASE_DB_URL", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB")) {
    if (-not $envVars.ContainsKey($required) -or [string]::IsNullOrWhiteSpace($envVars[$required])) {
        throw "$required is not set in .env"
    }
}

$containerName = "taskbeacon-db"
$running = docker ps --filter "name=$containerName" --format "{{.Names}}"
if ($running -ne $containerName) {
    throw "Local db container '$containerName' isn't running. Start it first: docker compose up db -d"
}

$localUrl = "postgresql://$($envVars['POSTGRES_USER']):$($envVars['POSTGRES_PASSWORD'])@localhost:5432/$($envVars['POSTGRES_DB'])"

Write-Host "Pulling public-schema data from Supabase into local db..." -ForegroundColor Cyan

docker run --rm postgres:17 pg_dump `
    --schema=public --data-only --inserts --disable-triggers `
    $envVars['SUPABASE_DB_URL'] |
    docker exec -i $containerName psql $localUrl

Write-Host "Done." -ForegroundColor Green
