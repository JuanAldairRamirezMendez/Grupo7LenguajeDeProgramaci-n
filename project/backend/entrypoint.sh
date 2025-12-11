#!/bin/sh

# Entrypoint para el contenedor: arrancar Gunicorn con workers uvicorn.
# Las migraciones se aplicarán manualmente (por ejemplo con DBeaver) según
# solicitó el usuario, por lo que aquí no se ejecuta Alembic.

exec gunicorn -k uvicorn.workers.UvicornWorker app.main:app -b 0.0.0.0:${PORT:-8000}
