"""
Script para inicializar un usuario admin en la base de datos
Uso: python -m scripts.init_admin
"""
import asyncio
import sys
sys.path.insert(0, '/opt/render/project/src/project/backend')

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.role import Role
from app.config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

async def init_admin():
    """Crear usuario admin si no existe"""
    
    # Crear conexión a BD
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        # Verificar si admin ya existe
        result = await db.execute(select(User).where(User.email == "admin@gmail.com"))
        admin = result.scalar_one_or_none()
        
        if admin:
            print("✅ Admin ya existe")
            return
        
        # Crear rol admin si no existe
        result = await db.execute(select(Role).where(Role.name == "admin"))
        admin_role = result.scalar_one_or_none()
        
        if not admin_role:
            admin_role = Role(name="admin", description="Administrator role")
            db.add(admin_role)
            await db.commit()
            await db.refresh(admin_role)
            print("✅ Rol admin creado")
        
        # Crear usuario admin
        password_hash = pwd_context.hash("admin123")
        admin_user = User(
            email="admin@gmail.com",
            password_hash=password_hash,
            role_id=admin_role.id,
            phone="+34600000000"
        )
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        
        print(f"✅ Usuario admin creado: admin@gmail.com / admin123")

if __name__ == "__main__":
    asyncio.run(init_admin())
