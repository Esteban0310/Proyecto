from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from datetime import datetime

router = APIRouter(
    prefix="/api/versiones",
    tags=["Versiones"]
)

# ✅ Crear una nueva versión (compatible con frontend actual)
@router.post("/", status_code=201)
def crear_version(version_data: dict, db: Session = Depends(get_db)):
    """
    Espera un JSON como:
    {
        "consentimiento_id": 1,
        "numero_version": "V.2",
        "fecha": "2025-10-21",
        "archivo": null,
        "creado_por": "test@gmail.com",
        "actualizado_por": "test@gmail.com"
    }
    """

    consentimiento_id = version_data.get("consentimiento_id")
    if not consentimiento_id:
        raise HTTPException(status_code=400, detail="Falta el campo 'consentimiento_id'")

    consentimiento = db.query(models.Consentimiento).filter(
        models.Consentimiento.id == consentimiento_id
    ).first()

    if not consentimiento:
        raise HTTPException(status_code=404, detail=f"No se encontró consentimiento con id={consentimiento_id}")

    # 🆕 Crear nueva versión
    nueva_version = models.VersionConsentimiento(
        consentimiento_id=consentimiento.id,
        numero_version=version_data.get("numero_version"),
        fecha=datetime.strptime(version_data.get("fecha"), "%Y-%m-%d"),
        archivo=version_data.get("archivo"),
        creado_por=version_data.get("creado_por"),
        actualizado_por=version_data.get("actualizado_por")
    )

    db.add(nueva_version)
    db.commit()
    db.refresh(nueva_version)

    # 🔁 Actualizar versión actual del consentimiento
    consentimiento.version = version_data.get("numero_version")
    consentimiento.actualizado_por = version_data.get("actualizado_por")
    consentimiento.fecha_actualizacion = datetime.utcnow()
    db.commit()

    return {"message": "✅ Versión creada correctamente", "id": nueva_version.id}


# ✅ Obtener todas las versiones
@router.get("/")
def obtener_versiones(db: Session = Depends(get_db)):
    versiones = db.query(models.VersionConsentimiento).all()
    return versiones


# ✅ Obtener versiones por consentimiento
@router.get("/consentimiento/{consentimiento_id}")
def obtener_versiones_por_consentimiento(consentimiento_id: int, db: Session = Depends(get_db)):
    versiones = db.query(models.VersionConsentimiento).filter(
        models.VersionConsentimiento.consentimiento_id == consentimiento_id
    ).all()
    if not versiones:
        raise HTTPException(status_code=404, detail="No se encontraron versiones para este consentimiento")
    return versiones


# ✅ Eliminar versión
@router.delete("/{version_id}")
def eliminar_version(version_id: int, db: Session = Depends(get_db)):
    version = db.query(models.VersionConsentimiento).filter(models.VersionConsentimiento.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Versión no encontrada")

    db.delete(version)
    db.commit()
    return {"message": "Versión eliminada correctamente"}
