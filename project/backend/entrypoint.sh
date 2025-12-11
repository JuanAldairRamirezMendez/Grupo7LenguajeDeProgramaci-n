#!/bin/sh
set -e

# Entrypoint para el contenedor: aplica migraciones (si DATABASE_URL está presente)
# y arranca gunicorn con workers uvicorn.

if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL detected — running alembic upgrade head..."
  alembic upgrade head || { echo "alembic failed"; exit 1; }
else
  echo "DATABASE_URL not set — skipping alembic migrations"
fi

# START the app
exec gunicorn -k uvicorn.workers.UvicornWorker app.main:app -b 0.0.0.0:${PORT:-8000}
