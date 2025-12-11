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
-- Ejecutar las migraciones / crear el esquema en la base de datos antes del primer tráfico. (Nota: en este repositorio las migraciones no se ejecutan automáticamente; se aplicarán manualmente usando DBeaver o herramientas equivalentes según la preferencia del equipo.)

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

## 4) Crear el esquema / aplicar migraciones (MANUAL)

Esta guía asume que **tú** aplicarás el esquema en la base de datos manualmente (por ejemplo con DBeaver, pgAdmin o psql). No se ejecutan migraciones automáticas en el contenedor.

Pasos recomendados con DBeaver (o herramienta similar):

1. Conéctate a la base de datos usando la `DATABASE_URL` proporcionada por Render.
2. Ejecuta los scripts SQL necesarios para crear las tablas y constraints que tu aplicación necesita. Si prefieres, puedes inspeccionar los archivos en `project/backend/alembic/versions` para ver el SQL que corresponde a cada migración y aplicarlo manualmente.
3. Verifica la existencia de la tabla `alembic_version` y, si la creas manualmente, inserta la versión actual del head si deseas llevar control de migraciones.

Notas:
- Si ya existen tablas parciales en la BD, revisa su estructura antes de aplicar cambios para evitar conflictos (p. ej. `DuplicateTableError`).
- Hacer el proceso manualmente con DBeaver te da control para resolver incompatibilidades antes de poner el servicio en producción.
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

## Frontend build en Render (problemas comunes y comando recomendado)

Si estás desplegando el frontend (carpeta `project/frontend`) en Render y ves errores como "Cannot find module '@rollup/rollup-linux-x64-gnu'" durante la fase de build, suele deberse a una dependencia opcional nativa de Rollup que falla en el entorno de build. Prueba estas opciones:

- **Comando de build recomendado (UI de Render):** configura el **Build Command** del servicio que construye el frontend con:

  ```powershell
  rm -rf node_modules package-lock.json
  npm run build:ci
  ```

  Esto fuerza una instalación limpia y evita que npm instale optionalDependencies problemáticos.

- **Archivo `.npmrc`:** el repo incluye `project/frontend/.npmrc` con `optional=false` para indicarle a npm que no instale optionalDependencies durante la instalación en CI/Render.

- **Node version:** asegúrate de que Render use la versión de Node indicada en `project/frontend/.nvmrc`. El build log muestra la versión usada (p.ej. `Node.js v20.19.6`). Si Render no soporta la versión exacta, ajusta `.nvmrc`/engines o selecciona otra versión compatible.

- **Alternativa robusta:** cambiar a `pnpm` o `yarn` para el builder del frontend, ya que manejan optionalDependencies de forma diferente. Puedo preparar los cambios para usar `pnpm` si lo prefieres.

Notas:

- Después de aplicar el Build Command en la UI de Render, selecciona "Clear cache and deploy" (o borra la caché desde la UI) para forzar una instalación limpia.
- Si prefieres que actualice el `render.yaml` para incluir ese Build Command automáticamente, dímelo y lo añado.


---

## Checklist final antes de marcar deploy como completado

- [ ] Servicio creado en Render y ligado al repo `main`.
- [ ] Secrets añadidos en Render (`DATABASE_URL`, `SECRET_KEY`, ...).
- [ ] Migraciones aplicadas (`alembic upgrade head`).
- [ ] Health check OK
- [ ] Pruebas básicas (register/login/create discount) funcionan.

---

Si quieres que cree el script `deploy_render.ps1` en el repo, o que ejecute alguno de los pasos por la CLI o API, dime cuál y lo hago ahora.
