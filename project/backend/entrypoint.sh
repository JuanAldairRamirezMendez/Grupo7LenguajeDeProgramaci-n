#!/bin/sh

# Entrypoint para el contenedor: arrancar Gunicorn con workers uvicorn.

exec gunicorn -k uvicorn.workers.UvicornWorker app.main:app -b 0.0.0.0:${PORT:-8000}
