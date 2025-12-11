# Despliegue y Configuración - Descuentos Rappi

## Variables de Entorno Necesarias

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
SECRET_KEY=tu_clave_secreta_muy_larga_y_aleatoria
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:5173  (en desarrollo)
```

### Frontend (.env o variables de entorno en Render)
```
VITE_API_URL=http://localhost:8000  (en desarrollo)
VITE_API_URL=https://tu-backend.onrender.com  (en producción)
```

## Inicialización de la Base de Datos

### 1. Crear usuario admin

Después del primer despliegue en Render:

```bash
# Localmente
python scripts/init_admin.py

# O en Render, ejecutar directamente desde la terminal del servicio
python scripts/init_admin.py
```

**Credenciales de admin:**
- Email: `admin@gmail.com`
- Contraseña: `admin123`

### 2. Usuarios normales

Cualquier usuario puede registrarse en `/register` con:
- Email (requerido)
- Contraseña (requerido)
- Nombre completo (opcional)
- Teléfono (opcional)

## Funcionalidades Implementadas

### ✅ Autenticación
- [x] Registro de usuarios
- [x] Login con JWT
- [x] Gestión de roles (admin/usuario)
- [x] CORS configurado

### ✅ Frontend
- [x] Página de login
- [x] Página de registro
- [x] Conexión real a API backend
- [x] Almacenamiento de token JWT
- [x] Dark mode

### ✅ Backend
- [x] Endpoints de auth (/auth/register, /auth/login)
- [x] Endpoints de discounts
- [x] Endpoints de admin
- [x] Middleware CORS

## Testing Local

### 1. Iniciar servicios
```bash
# Terminal 1: Backend
cd project/backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd project/frontend
npm run dev
```

### 2. Probar registro
1. Ir a `http://localhost:5173/register`
2. Rellenar formulario con email y contraseña
3. Ver respuesta en la consola del navegador

### 3. Probar login
1. Ir a `http://localhost:5173`
2. Usar credenciales de admin o usuario registrado
3. Deberías ser redirigido a `/admin` o `/user`

### 4. Probar con curl
```bash
# Registrarse
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"test123","phone":null}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"test123"}'
```

## Despliegue en Render

### Backend
1. Crear servicio Web Service (Docker)
2. Conectar repositorio
3. Root Directory: `project/backend`
4. Build Command: default (Dockerfile)
5. Variables de entorno:
   - `DATABASE_URL` (PostgreSQL en Render)
   - `SECRET_KEY`
   - `ALGORITHM=HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES=60`
   - `FRONTEND_URL=https://tu-frontend.onrender.com`

### Frontend
1. Crear servicio Web Service (Node)
2. Root Directory: `project/frontend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run preview`
5. Variables de entorno:
   - `VITE_API_URL=https://tu-backend.onrender.com`

### Post-Deploy
Después de desplegar el backend en Render:
1. Conectar a la base de datos PostgreSQL desde DBeaver o pgAdmin
2. Ejecutar el script de inicialización del admin (si es necesario)
3. Probar endpoints en Postman o curl

## Errores Comunes

### CORS bloqueado
- Verificar que `FRONTEND_URL` esté correcto en el backend
- Verificar que `VITE_API_URL` esté correcto en el frontend

### Token inválido
- Verificar que `SECRET_KEY` es la misma en dev y producción
- Verificar que `ALGORITHM` es correcto

### Base de datos no conecta
- Verificar `DATABASE_URL` en Render
- Asegurar que PostgreSQL está accesible desde Render
