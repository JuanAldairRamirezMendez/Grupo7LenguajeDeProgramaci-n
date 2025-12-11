# Despliegue en Render — Backend

Este documento contiene una guía paso a paso para desplegar el backend en Render usando Docker. Está pensada para el repositorio `Grupo7LenguajeDeProgramaci-n` y el servicio backend ubicado en `project/backend`.

Antes de empezar, asumimos que ya hiciste merge de los cambios en la rama `main` y que el repo contiene:

- `project/backend/Dockerfile` (Dockerfile para el servicio)
- `render.yaml` (manifest opcional ya añadido)
- Migraciones Alembic en `project/backend/alembic`

Si algo difiere, revisa la ruta del Dockerfile y la rama que usarás (recomendado: `main`).

---

## Resumen rápido

- Opción recomendada: configurar `Root Directory` en Render a `project/backend` y dejar `Dockerfile` como `Dockerfile` (relativo a esa raíz).
- Alternativa: dejar `Root Directory` vacío y poner `project/backend/Dockerfile` en **Dockerfile Path**.
- Añadir Secrets: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `FRONTEND_URL`.
- Ejecutar migraciones `alembic upgrade head` contra la base de datos de Render antes del primer tráfico.

---

## 1) Conectar el repo a Render

1. Entra en https://render.com y accede a tu cuenta.
2. Haz clic en **New → Web Service**.
3. Autoriza y conecta GitHub si aún no lo has hecho, y selecciona el repositorio `Grupo7LenguajeDeProgramaci-n`.

---

## 2) Crear el Web Service (UI recomendada)

### Opción A — Fijar `Root Directory` (recomendada)

1. En la pantalla de creación del servicio, pon:
   - **Environment:** Docker
   - **Root Directory:** `project/backend`
   - **Dockerfile Path:** `Dockerfile` (porque es relativo al root)
   - **Branch:** `main`
   - **Health Check Path:** `/health`
   - **Name:** `descuentos-backend` (o tu preferencia)
2. Crea el servicio y espera a que Render inicie el build.

### Opción B — Ruta completa al Dockerfile

1. Si no usas `Root Directory`, en **Dockerfile Path** escribe exactamente `project/backend/Dockerfile`.
2. El resto de opciones: `Branch: main`, `Health Check Path: /health`.

### Opción C — Usar `render.yaml`

Si Render detecta `render.yaml` en la raíz, puede aplicar la configuración automáticamente. El `render.yaml` incluido en este repo ya apunta a `project/backend/Dockerfile`.

---

## 3) Añadir Secrets / Environment Variables

En el panel del servicio en Render → **Environment** → añade los siguientes (use `Secret` para valores sensibles):

- `DATABASE_URL` — connection string Postgres (p.ej. `postgresql://user:pass@host:5432/dbname`)
- `SECRET_KEY` — JWT secret
- `ALGORITHM` — `HS256` (u otro si lo configuras)
- `ACCESS_TOKEN_EXPIRE_MINUTES` — `60` (o valor deseado)
- `FRONTEND_URL` — URL del frontend (p.ej. `https://app.tu-dominio.com`)

Si vas a provisionar la base en Render, createla desde **New → PostgreSQL** y copia la `DATABASE_URL` que Render te da.

---

## 4) Ejecutar migraciones

Recomendación: ejecutar `alembic upgrade head` *antes* de exponer la aplicación al tráfico.

### Opción A — Desde tu máquina (PowerShell)

1. Copia la `DATABASE_URL` desde los Secrets de Render.
2. En tu máquina, desde la carpeta `project/backend` y con el virtualenv activado:

```powershell
cd 'C:\Users\aldai\Downloads\proyectos\descuentosRappi\project\backend'
#$env:DATABASE_URL='postgresql://user:pass@host:5432/dbname'  # usa la URL real
$env:DATABASE_URL='PASTE_AQUI_LA_DATABASE_URL'
& '.\.venv\Scripts\python.exe' -m alembic upgrade head
```

### Opción B — Job manual en Render

1. En Render → **New → Job** → crea un Job manual.
2. Configura:
   - Tipo: `Manual Job`
   - Branch: `main`
   - Command: `alembic upgrade head`
   - Environment: Docker (misma imagen que el servicio)
   - Proporciona los mismos Secrets.
3. Ejecuta el Job (`Run Job`) para aplicar las migraciones.

Nota: Si usas la imagen Docker creada aquí, hemos añadido un `entrypoint.sh` que intentará ejecutar `alembic upgrade head` automáticamente al arrancar el contenedor (si `DATABASE_URL` está definido en los env vars). Esto es útil para despliegues automáticos, pero recomendamos usar un Job manual la primera vez para controlar el proceso.
---

## 5) Verificar despliegue

1. Tras el build, abre la URL pública del servicio (Render provee `https://<servicename>.onrender.com`).
2. Health: `GET /health` debe devolver `{"status":"ok"}`.
3. Prueba endpoints básicos (usando curl o Postman):

```powershell
# Registro
curl -X POST 'https://<tu-servicio>.onrender.com/auth/register' -H 'Content-Type: application/json' -d '{"email":"test@example.com","password":"Secret123!","full_name":"Test"}'

# Login (obtener token)
curl -X POST 'https://<tu-servicio>.onrender.com/auth/login' -H 'Content-Type: application/json' -d '{"email":"test@example.com","password":"Secret123!"}'

# Crear descuento (usar token obtenido)
curl -X POST 'https://<tu-servicio>.onrender.com/discounts/' -H "Authorization: Bearer <TOKEN>" -H 'Content-Type: application/json' -d '{"title":"Prueba","description":"desc"}'
```

4. Revisa **Logs** en Render para errores en build o runtime.

---

## 6) Troubleshooting (errores comunes)

- Build falla por no encontrar Dockerfile: revisa **Root Directory** y **Dockerfile Path**.
- Error al conectar DB: revisa `DATABASE_URL` y que la DB acepte conexiones remotas (puerto y firewall).
- Migraciones fallan: ejecuta `alembic current` y `alembic history` localmente para diagnosticar.
- Problemas con dependencias nativas (psycopg libs): el `Dockerfile` del repo instala `gcc libpq-dev` para compilar dependencias.

---

## 7) Scripts útiles (opcional)

Puedes añadir un script PowerShell en `project/backend/scripts/deploy_render.ps1` que automatice la ejecución de migraciones y verifique `/health`:

```powershell
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
$resp = Invoke-RestMethod -Method Get -Uri 'https://<tu-servicio>.onrender.com/health'
Write-Host "Health response: $($resp | ConvertTo-Json)"
```

Si quieres que lo añada al repo y lo comite, dímelo y lo creo.

---

## Checklist final antes de marcar deploy como completado

- [ ] Servicio creado en Render y ligado al repo `main`.
- [ ] Secrets añadidos en Render (`DATABASE_URL`, `SECRET_KEY`, ...).
- [ ] Migraciones aplicadas (`alembic upgrade head`).
- [ ] Health check OK
- [ ] Pruebas básicas (register/login/create discount) funcionan.

---

Si quieres que cree el script `deploy_render.ps1` en el repo, o que ejecute alguno de los pasos por la CLI o API, dime cuál y lo hago ahora.
