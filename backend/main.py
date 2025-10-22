from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from routers import consentimientos, versiones

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Backend Consentimientos")

origins = [
    "http://localhost",
    "http://localhost:4200",
    "http://127.0.0.1",
    "http://127.0.0.1:4200",
    "http://frontend",
    "http://frontend:4200",
    "*",  # solo para desarrollo
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔗 Rutas
app.include_router(consentimientos.router)
app.include_router(versiones.router)

@app.get("/")
def root():
    return {"message": "Backend funcionando 🚀"}
