# Backend (Rappi Discounts)

Resumen rápido de cómo trabajar con el backend, desplegar en Render y buenas prácticas.

Requisitos
- Python 3.11
- virtualenv
- Docker (opcional para desarrollo)

Instalación local
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Variables de entorno (no subir al repo)
- Crea `project/backend/.env` y añade:
```
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<host>/<db>
SECRET_KEY=tu_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Correr localmente (dev)
```powershell
uvicorn app.main:app --reload --port 8000
```

Docker (dev)
```powershell
docker compose up --build
```

Despliegue en Render (resumen)
1. Crear un servicio PostgreSQL en Render (si no existe). Copia el External Database URL.
2. Crear un Web Service en Render apuntando al repo y rama.
3. En Settings -> Environment, añadir Secrets:
   - `DATABASE_URL` = External Database URL
   - `SECRET_KEY`, `ALGORITHM`, etc.
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn -k uvicorn.workers.UvicornWorker app.main:app -b 0.0.0.0:$PORT`
6. Activar Auto Deploy si lo deseas.

Notas
- No subas `.env` ni secretos al repo. Usa `.gitignore` y secretos del proveedor.
- Usa Alembic para migraciones (evita `init_db()` en producción).
