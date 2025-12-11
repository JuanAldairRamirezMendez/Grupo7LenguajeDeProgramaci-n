from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import time
import traceback

#Carga .env (solo en desarrollo)
load_dotenv()

#Configuración básica desde env
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3007")
ALLOWED_ORIGINS = [FRONTEND_URL, "http://localhost:8000", "http://127.0.0.1:8000"]

app = FastAPI(title="Rappi Discounts API")

#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Middleware simple de logging (tiempo de respuesta)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed = (time.time() - start) * 1000
    print(f"{request.method} {request.url.path} - {response.status_code} - {elapsed:.2f}ms")
    return response

#Handler global de excepciones
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    #Aquí puedes mejorar el logging y enviar a un sistema de errores
    # Print traceback to console for debugging (development only)
    print("Unhandled exception:", repr(exc))
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": "Internal Server error"})

# Routers (registra los routers reales cuando existan)
# Import models via importlib so we don't overwrite the `app` FastAPI variable
import importlib
importlib.import_module("app.models")  # ensure all SQLAlchemy models are imported and registered
from app.routers import auth
app.include_router(auth.router, prefix="/auth", tags=["auth"])

# otros routers los añadiremos cuando estén listos

@app.get("/health", tags=["health"])
def health():
    return {"status":  "ok"}

#Eventos statup/shutdown para DB
@app.on_event("startup")
async def on_startup():
    #inicializar conexión a DB, cachés, etc.
    db_url = os.getenv("DATABASE_URL")
    print("Startup: DATABASE_URL =", "[hidden]" if db_url else "not set")
    #Si usas SQLAlchemy, aquí creas engine / sessionmaker o pruebas conexión

@app.on_event("shutdown")
async def on_shutdown():
    #cerrar conexiones si es necesario
    print("Shutdown: cleaning up resources")