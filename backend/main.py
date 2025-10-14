from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
import database
from routers import consentimientos

# Crear tablas
models.Consentimiento.metadata.create_all(bind=database.engine)
models.VersionConsentimiento.metadata.create_all(bind=database.engine)

app = FastAPI(title="Backend Consentimientos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost",      
        "http://localhost:80",   
        "http://frontend",       
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consentimientos.router)

@app.get("/")
def root():
    return {"message": "Backend funcionando 🚀"}