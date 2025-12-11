# Documentación Completa - Descuentos Rappi

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Backend (FastAPI)](#backend-fastapi)
4. [Frontend (React)](#frontend-react)
5. [Flujos de Autenticación](#flujos-de-autenticación)
6. [Base de Datos](#base-de-datos)
7. [Deployment](#deployment)
8. [Endpoints API](#endpoints-api)

---

## 🎯 Introducción

**Descuentos Rappi** es una aplicación web fullstack que permite a los usuarios:
- 📝 **Registrarse** con email y contraseña
- 🔐 **Iniciar sesión** con JWT authentication
- 👤 **Gestionar su perfil** (editar teléfono, eliminar cuenta)
- 👨‍💼 **Acceso de administrador** con credenciales especiales
- 📊 **Ver descuentos** y gestionar información

**Stack Tecnológico:**
- **Backend:** FastAPI (Python) + PostgreSQL
- **Frontend:** React 19 + Vite 4.5 + React Router 7 + TailwindCSS
- **Autenticación:** JWT (JSON Web Tokens)
- **Deployment:** Render (Web Services Docker)

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO EN NAVEGADOR                    │
└─────────────────────────────────────────────────────────────┘
                             │
                    HTTPS (CORS Habilitado)
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────▼──────────────────┐         ┌──────────▼─────────────┐
│   FRONTEND (Render)      │         │   BACKEND (Render)     │
│ - React 19              │         │ - FastAPI              │
│ - Vite Build            │         │ - Gunicorn/Uvicorn    │
│ - Express Server        │         │ - SQL Async            │
│ - SPA Routing           │         │ - JWT Auth             │
└───────┬──────────────────┘         └──────────┬─────────────┘
        │                                       │
        │          JSON API Calls               │
        │         (Bearer Token JWT)            │
        │                                       │
        └───────────────────┬───────────────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │   (Render)     │
                    │                │
                    │  - users       │
                    │  - roles       │
                    │  - discounts   │
                    └────────────────┘
```

---

## 💻 Backend (FastAPI)

### 📂 Estructura de Carpetas

```
project/backend/
├── app/
│   ├── main.py              # Punto de entrada, middlewares, routers
│   ├── config.py            # Variables de entorno y configuración
│   ├── database.py          # Conexión a PostgreSQL (async)
│   ├── models/              # SQLAlchemy ORM Models
│   │   ├── user.py          # Modelo Usuario
│   │   ├── role.py          # Modelo Rol (admin/user)
│   │   └── discount.py      # Modelo Descuentos
│   ├── routers/             # Controladores (Endpoints)
│   │   ├── auth.py          # Login, Register, Profile
│   │   ├── discounts.py     # CRUD de descuentos
│   │   └── admin.py         # Endpoints administrativos
│   ├── schemas/             # Pydantic models (validación)
│   │   └── user.py          # UserCreate, UserOut, ProfileOut
│   ├── services/            # Lógica de negocio
│   │   └── metrics_service.py
│   └── utils/               # Helpers
│       ├── jwt.py           # JWT utilities
│       └── notifications.py
├── alembic/                 # Migraciones (no automáticas)
├── requirements.txt         # Dependencias Python
├── Dockerfile               # Imagen Docker
├── entrypoint.sh           # Script de inicio
└── alembic.ini             # Configuración de Alembic
```

### 🔧 Configuración Principal (`app/main.py`)

```python
# CORS permitidos
ALLOWED_ORIGINS = [
    FRONTEND_URL,  # Variable de entorno
    "http://localhost:5173",        # Dev local
    "https://descuentos-frontend.onrender.com",
    "https://frontend-m9x8.onrender.com"
]

# Middlewares
- CORSMiddleware: Permite comunicación entre frontend y backend
- Logging: Registra tiempo de respuesta de cada request
- Exception Handler: Maneja errores globales

# Routers incluidos
- /auth     → Autenticación (register, login, profile)
- /discounts → Gestión de descuentos
- /health   → Health check para Render
```

### 🔐 Autenticación (JWT)

**Flujo:**
```
1. Usuario envía: POST /auth/login {email, password}
2. Backend valida con Passlib (pbkdf2_sha256)
3. Si válido, genera JWT: {sub: user_id, email, exp}
4. Frontend guarda en localStorage
5. Requests posteriores incluyen: Authorization: Bearer <token>
6. Backend valida token antes de procesar
```

**Estructura del Token:**
```json
{
  "sub": "1",                    // ID del usuario
  "email": "user@example.com",
  "exp": 1702393200,             // Expira en 60 minutos
  "iat": 1702389600
}
```

### 📊 Modelos de Base de Datos

#### Users (Usuarios)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20),
  role_id INT FOREIGN KEY,
  device_token TEXT,
  created_at TIMESTAMP,
  last_login TIMESTAMP
)
```

#### Roles (Roles)
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,  -- 'admin' o 'user'
  description VARCHAR(255)
)
```

#### Discounts (Descuentos)
```sql
CREATE TABLE discounts (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage DECIMAL,
  expiration_date DATE,
  created_by INT FOREIGN KEY,
  created_at TIMESTAMP
)
```

### 📡 Endpoints Principales

#### 🔑 Autenticación (`/auth`)

| Método | Endpoint | Parámetros | Respuesta |
|--------|----------|-----------|----------|
| POST | `/auth/register` | `{email, password, phone?}` | `{id, email, role_id, created_at}` |
| POST | `/auth/login` | `{email, password}` | `{access_token, token_type}` |
| GET | `/auth/me` | Header: `Authorization: Bearer <token>` | `{id, email, phone, role_id, created_at}` |
| PUT | `/auth/me` | `{phone?}` + Bearer token | `{id, email, phone, role_id}` |
| DELETE | `/auth/me` | Bearer token | `{detail: "Account deleted"}` |

#### 💰 Descuentos (`/discounts`)
```
GET /discounts              → Listar todos
GET /discounts/{id}        → Detalle
POST /discounts            → Crear (requiere admin)
PUT /discounts/{id}        → Editar (requiere admin)
DELETE /discounts/{id}     → Eliminar (requiere admin)
```

### 🛡️ Seguridad

- **Password Hashing:** Passlib con pbkdf2_sha256
- **JWT:** Tokens con expiración de 60 minutos
- **CORS:** Whitelist de orígenes permitidos
- **Authorization Header:** Bearer token obligatorio
- **Async Database:** Conexión no-bloqueante con asyncpg

---

## ⚛️ Frontend (React)

### 📂 Estructura de Carpetas

```
project/frontend/
├── src/
│   ├── main.jsx                 # Punto de entrada
│   ├── App.jsx                  # Componente raíz
│   ├── index.css                # Estilos globales
│   ├── App.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx       # Navegación
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Table.jsx
│   │   └── charts/
│   │       └── UserChart.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx        # Página de login
│   │   │   └── Register.jsx     # Página de registro
│   │   ├── user/
│   │   │   ├── UserHome.jsx     # Dashboard usuario
│   │   │   └── Profile.jsx      # Perfil de usuario
│   │   └── admin/
│   │       └── AdminDashboard.jsx # Panel admin
│   ├── router/
│   │   └── AppRouter.jsx        # React Router config
│   └── services/
│       ├── auth.service.js      # Servicios de auth
│       └── productService.js    # Servicios de productos
├── server.js                    # Express server para SPA
├── vite.config.js               # Configuración Vite
├── tailwind.config.js           # TailwindCSS config
└── package.json
```

### 🎨 Características del Frontend

#### 1️⃣ **Sistema de Autenticación**

**Página de Login (`Login.jsx`)**
- Email y contraseña requeridos
- Validación en cliente
- Manejo de errores del servidor
- Dark mode toggle
- Redirección según rol (admin → `/admin`, user → `/user`)

**Página de Registro (`Register.jsx`)**
- Email y contraseña requeridos
- Teléfono y nombre opcionales
- Validación de campos
- Mensajes de éxito/error
- Redirección a login después de registrar

**Servicio de Autenticación (`auth.service.js`)**
```javascript
export const register(email, password, full_name, phone)
export const login(email, password)
export const logout()
export const getProfile()              // GET /auth/me
export const updateProfile(phone)      // PUT /auth/me
export const deleteAccount()           // DELETE /auth/me

// Helpers
export const getToken()                // localStorage
export const getEmail()
export const getRole()                 // 'admin' o 'user'
export const isAuthenticated()
export const isAdmin()
```

#### 2️⃣ **Gestión de Perfil**

**Página de Perfil (`Profile.jsx`)**
- Ver información personal (email, teléfono, rol)
- Editar teléfono
- Eliminar cuenta con confirmación
- Soporte dark mode
- Manejo de errores y tokens inválidos

#### 3️⃣ **Navegación**

**Navbar (`Navbar.jsx`)**
- Botón "Perfil" → `/user/profile` (solo autenticados)
- Toggle dark mode
- Botón cerrar sesión
- Responsive design

**Router (`AppRouter.jsx`)**
```
/              → Login
/register      → Register
/admin         → Admin Dashboard
/user          → User Home
/user/profile  → Profile
```

#### 4️⃣ **Almacenamiento de Token**

```javascript
// Login exitoso
localStorage.setItem('token', response.access_token)
localStorage.setItem('email', user.email)
localStorage.setItem('rol', user.role_id === 1 ? 'admin' : 'user')

// Logout
localStorage.removeItem('token')
localStorage.removeItem('email')
localStorage.removeItem('rol')
```

#### 5️⃣ **Manejo de CORS**

Todas las requests incluyen:
```javascript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`  // Para requests autenticados
}
```

### 🚀 Servidor Express (`server.js`)

FastAPI sirve la API, pero el frontend necesita un servidor SPA:

```javascript
// Sirve archivos estáticos de dist/
app.use(express.static('dist'))

// SPA catch-all: cualquier ruta desconocida devuelve index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// React Router maneja las rutas en el cliente
```

### 🎯 Flujo de Autenticación (Frontend)

```
1. Usuario va a https://descuentos-frontend.onrender.com
   → Se carga index.html desde Express
   → React Router muestra Login (/`)

2. Usuario ingresa email y contraseña
   → Click en "Iniciar sesión"
   → POST a https://descuentos-backend.onrender.com/auth/login

3. Backend responde con token JWT
   → Frontend guarda en localStorage
   → Redirige a /admin o /user según rol

4. Usuario hace click en "Perfil"
   → GET /auth/me con Bearer token
   → Muestra datos personales

5. Usuario edita teléfono
   → PUT /auth/me {phone} con Bearer token
   → Actualiza estado local
   → Muestra mensaje de éxito

6. Usuario click "Cerrar sesión"
   → localStorage.clear()
   → Redirige a / (Login)
```

### 🎨 Estilos con TailwindCSS

- Dark mode con `dark:` prefix
- Colores: azul (primary), rojo (danger), verde (success)
- Responsive design mobile-first
- Animaciones suaves con transiciones

---

## 🔄 Flujos de Autenticación

### Registro Nuevo Usuario

```
Cliente (Frontend)                  Servidor (Backend)
    │                                   │
    ├─ POST /auth/register ─────────→ │
    │  {email, password, phone}       │
    │                                  ├─ Valida email único
    │                                  ├─ Hashea password
    │                                  ├─ Crea usuario con rol 'user'
    │                                  │
    │ ← {id, email, role_id} ────────│
    │
    ├─ Redirige a /
    └─ Usuario logea manualmente
```

### Login Usuario Existente

```
Cliente (Frontend)                  Servidor (Backend)
    │                                   │
    ├─ POST /auth/login ────────────→ │
    │  {email, password}               │
    │                                  ├─ Busca usuario por email
    │                                  ├─ Verifica password con Passlib
    │                                  ├─ Genera JWT token
    │                                  │
    │ ← {access_token, token_type} ──│
    │
    ├─ localStorage.setItem('token', ...)
    ├─ Redirige a /admin o /user
    └─ Token incluido en future requests
```

### Acceso a Perfil (Autenticado)

```
Cliente (Frontend)                  Servidor (Backend)
    │                                   │
    ├─ GET /auth/me ────────────────→ │
    │  Header: Authorization: Bearer...│
    │                                  ├─ Valida JWT
    │                                  ├─ Obtiene user_id del token
    │                                  ├─ Busca usuario en BD
    │                                  │
    │ ← {id, email, phone, ...} ────│
    │
    └─ Renderiza perfil con datos
```

### Editar Perfil

```
Cliente (Frontend)                  Servidor (Backend)
    │                                   │
    ├─ PUT /auth/me ────────────────→ │
    │  {phone}                        │
    │  Header: Authorization: Bearer..│
    │                                  ├─ Valida JWT
    │                                  ├─ Obtiene usuario actual
    │                                  ├─ Actualiza teléfono
    │                                  ├─ Persiste en BD
    │                                  │
    │ ← {id, email, phone, ...} ────│
    │
    └─ Muestra "Actualizado!"
```

### Eliminar Cuenta

```
Cliente (Frontend)                  Servidor (Backend)
    │                                   │
    ├─ DELETE /auth/me ─────────────→ │
    │  Header: Authorization: Bearer..│
    │                                  ├─ Valida JWT
    │                                  ├─ Obtiene usuario
    │                                  ├─ Elimina de BD
    │                                  │
    │ ← {detail: "Deleted"} ────────│
    │
    ├─ localStorage.clear()
    └─ Redirige a /
```

---

## 🗄️ Base de Datos (PostgreSQL)

### Conexión

**Connection String:**
```
postgresql+asyncpg://user:password@host:5432/database
```

**Async Driver:** asyncpg (no-bloqueante, high performance)

**Pool Configuration:**
- Conexiones reutilizables
- Timeout: 30 segundos
- Min size: 5, Max size: 20

### Tablas Principales

#### users
```sql
id              INTEGER PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   TEXT NOT NULL
role_id         INTEGER FOREIGN KEY → roles(id)
phone           VARCHAR(20)
device_token    TEXT
created_at      TIMESTAMP DEFAULT now()
last_login      TIMESTAMP
```

#### roles
```sql
id          INTEGER PRIMARY KEY
name        VARCHAR(50) UNIQUE NOT NULL
description VARCHAR(255)
```

**Datos por defecto:**
```
id=1, name='admin', description='Administrator'
id=2, name='user', description='Regular User'
```

#### discounts
```sql
id                  INTEGER PRIMARY KEY
title               VARCHAR(255) NOT NULL
description         TEXT
discount_percentage DECIMAL
expiration_date     DATE
created_by          INTEGER FOREIGN KEY → users(id)
created_at          TIMESTAMP DEFAULT now()
```

---

## 🚀 Deployment

### Render Services

#### Backend Service
- **Name:** descuentos-backend
- **Type:** Web Service (Docker)
- **Build:** Dockerfile
- **Start:** gunicorn con uvicorn workers
- **Port:** 10000 (Render)

**Environment Variables:**
```
DATABASE_URL=postgresql+asyncpg://...  # PostgreSQL URL
SECRET_KEY=...                          # JWT secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=https://descuentos-frontend.onrender.com
```

#### Frontend Service
- **Name:** descuentos-frontend
- **Type:** Web Service (Node)
- **Build:** npm install && npm run build
- **Start:** npm run start (node server.js)
- **Port:** 5173 (Render) / 3000 (local)

**Environment Variables:**
```
VITE_API_URL=https://descuentos-backend.onrender.com
```

### Docker (Backend)

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && apt-get install -y gcc libpq-dev
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 8000
CMD ["./entrypoint.sh"]
```

### Build Process

**Frontend:**
```bash
npm install                    # Instala dependencias
npm run build                  # Vite build → dist/
npm run start                  # node server.js
```

**Backend:**
```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

---

## 📝 Resumen Técnico

### Características Implementadas ✅

- [x] **Registro de usuarios** con validación
- [x] **Login con JWT** (60 min expiry)
- [x] **Gestión de perfil** (ver, editar, eliminar)
- [x] **Roles** (admin/user)
- [x] **CORS** correctamente configurado
- [x] **Dark mode** en UI
- [x] **Autenticación persistente** (localStorage)
- [x] **Async database** (no-bloqueante)
- [x] **Error handling** global
- [x] **SPA routing** (React Router)
- [x] **Express server** para SPA en producción

### Tecnologías Clave

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Backend | FastAPI | 0.104+ |
| Frontend | React | 19.2 |
| Build | Vite | 4.5 |
| Styling | TailwindCSS | 3.4 |
| Database | PostgreSQL | 13+ |
| Auth | JWT + Passlib | - |
| ORM | SQLAlchemy async | 2.0+ |
| Deploy | Render | - |

### Mejoras Futuras 🚀

1. **Cambio de contraseña** - Endpoint PUT /auth/password
2. **Refresh tokens** - Extender sesión sin relogear
3. **Email verification** - Validar email antes de activar
4. **2FA** - Autenticación de dos factores
5. **Historial de descuentos** - Tracking de uso
6. **Admin panel mejorado** - Gestión de usuarios y descuentos
7. **Notificaciones** - Push notifications para descuentos
8. **Testing** - Unit tests y E2E tests

---

## 👥 Credenciales de Prueba

### Admin
```
Email: admin@gmail.com
Password: admin123
Rol: administrator
```

### Usuario Regular
```
Registrarse en: https://descuentos-frontend.onrender.com/register
Email: tu-email@gmail.com
Password: tu-contraseña
Rol: user
```

---

## 🔗 URLs Importantes

**En Producción (Render):**
- Frontend: https://descuentos-frontend.onrender.com
- Backend: https://descuentos-backend.onrender.com

**En Desarrollo (Local):**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 📞 Contacto y Soporte

Para preguntas o issues:
1. Revisar logs en Render dashboard
2. Verificar variables de entorno
3. Validar CORS configuration
4. Revisar console del navegador (F12)

---

**Última actualización:** 11 de Diciembre de 2025
**Versión:** 1.0.0
