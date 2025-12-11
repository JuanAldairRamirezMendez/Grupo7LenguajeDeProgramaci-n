from dotenv import load_dotenv
import os

# Carga variables de entorno desde .env en desarrollo
load_dotenv()


class Settings:
	SECRET_KEY: str = os.getenv("SECRET_KEY", "devsecret")
	ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
	ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
	DATABASE_URL: str | None = os.getenv("DATABASE_URL")
	FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3007")


settings = Settings()

