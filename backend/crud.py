from sqlalchemy.orm import Session
import models
import schemas
from datetime import datetime


# Crear consentimiento
def crear_consentimiento(db: Session, consentimiento: schemas.ConsentimientoCreate):
    db_consentimiento = models.Consentimiento(
        id_consentimiento=consentimiento.id_consentimiento,  # alias de idConsentimiento
        email=consentimiento.email,
        consentimiento=consentimiento.consentimiento,
        archivo=consentimiento.archivo,
        version=consentimiento.version,
        creado_por=consentimiento.creado_por,  # alias de creadoPor
        actualizado_por=consentimiento.actualizado_por,  # alias de actualizadoPor
        fecha_creacion=datetime.utcnow(),
        fecha_actualizacion=datetime.utcnow(),
        activo=consentimiento.activo,
    )
    db.add(db_consentimiento)
    db.commit()
    db.refresh(db_consentimiento)
    return db_consentimiento


# Obtener todos los consentimientos
def obtener_consentimientos(db: Session):
    return db.query(models.Consentimiento).all()


# Obtener consentimiento por ID
def obtener_consentimiento(db: Session, consentimiento_id: int):
    return db.query(models.Consentimiento).filter(models.Consentimiento.id == consentimiento_id).first()


# Actualizar consentimiento existente
def actualizar_consentimiento(db: Session, consentimiento_id: int, consentimiento: schemas.ConsentimientoCreate):
    db_consentimiento = obtener_consentimiento(db, consentimiento_id)
    if not db_consentimiento:
        return None

    db_consentimiento.id_consentimiento = consentimiento.id_consentimiento
    db_consentimiento.email = consentimiento.email
    db_consentimiento.consentimiento = consentimiento.consentimiento
    db_consentimiento.archivo = consentimiento.archivo
    db_consentimiento.version = consentimiento.version
    db_consentimiento.actualizado_por = consentimiento.actualizado_por
    db_consentimiento.fecha_actualizacion = datetime.utcnow()
    db_consentimiento.activo = consentimiento.activo

    db.commit()
    db.refresh(db_consentimiento)
    return db_consentimiento


# Eliminar consentimiento
def eliminar_consentimiento(db: Session, consentimiento_id: int):
    db_consentimiento = obtener_consentimiento(db, consentimiento_id)
    if db_consentimiento:
        db.delete(db_consentimiento)
        db.commit()
        return True
    return False
