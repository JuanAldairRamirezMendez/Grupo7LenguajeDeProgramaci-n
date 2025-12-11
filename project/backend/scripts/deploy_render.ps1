Param(
  [string]$DatabaseUrl
)

if (-not $DatabaseUrl) {
  Write-Error "Pasa la DATABASE_URL como argumento: .\deploy_render.ps1 -DatabaseUrl '<url>'"
  exit 1
}

$env:DATABASE_URL = $DatabaseUrl
Write-Host "Ejecutando migraciones contra $env:DATABASE_URL"
& '.\.venv\Scripts\python.exe' -m alembic upgrade head

Write-Host "Comprobando /health..."
$resp = Invoke-RestMethod -Method Get -Uri 'https://<tu-servicio>.onrender.com/health' -ErrorAction SilentlyContinue
if ($resp) { Write-Host "Health response: $($resp | ConvertTo-Json)" } else { Write-Host "No se pudo comprobar /health. Revisa la URL del servicio." }
