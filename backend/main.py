from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
import database
from routers import consentimientos  # Asegúrate de tener esta carpeta con tus endpoints

# Crear tablas
models.Consentimiento.metadata.create_all(bind=database.engine)
models.VersionConsentimiento.metadata.create_all(bind=database.engine)

app = FastAPI(title="Backend Consentimientos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consentimientos.router)

@app.get("/")
def root():
    return {"message": "Backend funcionando 🚀"}

@app.get("/api/health")
def health():
    return {"status": "ok"}
