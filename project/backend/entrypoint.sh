#!/bin/sh

# Entrypoint para el contenedor: ejecutar migraciones y arrancar Gunicorn.

# Ejecutar migraciones de Alembic
echo "Running database migrations..."
alembic upgrade head

# Arrancar Gunicorn con workers uvicorn
echo "Starting Gunicorn..."
exec gunicorn -k uvicorn.workers.UvicornWorker app.main:app -b 0.0.0.0:${PORT:-8000}
