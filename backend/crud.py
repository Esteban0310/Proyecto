from sqlalchemy.orm import Session
import models
import schemas
from datetime import datetime


# ✅ CREAR
def crear_consentimiento(db: Session, consentimiento: schemas.ConsentimientoCreate):
    db_consentimiento = models.Consentimiento(
        id_consentimiento=consentimiento.id_consentimiento,
        email=consentimiento.email,
        consentimiento=consentimiento.consentimiento,
        archivo=consentimiento.archivo,
        version=consentimiento.version,
        creado_por=consentimiento.creado_por,
        actualizado_por=consentimiento.actualizado_por,
        fecha_creacion=datetime.utcnow(),   
        fecha_actualizacion=datetime.utcnow(),
        activo=consentimiento.activo,

        # CAMPOS EXTRA
        profesional=consentimiento.profesional,
        email_profesional=consentimiento.email_profesional,
        instituto=consentimiento.instituto,
        servicio=consentimiento.servicio,
        lateralidad=consentimiento.lateralidad,
        aceptado=consentimiento.aceptado,
        observaciones=consentimiento.observaciones,
        estado=consentimiento.estado,
    )

    db.add(db_consentimiento)
    db.commit()
    db.refresh(db_consentimiento)
    return db_consentimiento


# ✅ LISTAR
def obtener_consentimientos(db: Session):
    return db.query(models.Consentimiento).all()


# ✅ OBTENER UNO
def obtener_consentimiento(db: Session, consentimiento_id: int):
    return db.query(models.Consentimiento).filter(
        models.Consentimiento.id == consentimiento_id
    ).first()


# ✅ UPDATE COMPLETO (FIX PRINCIPAL)
def actualizar_consentimiento(
    db: Session,
    consentimiento_id: int,
    consentimiento: schemas.ConsentimientoCreate
):

    db_consentimiento = obtener_consentimiento(db, consentimiento_id)

    if not db_consentimiento:
        return None

    # 👉 FORZAMOS UPDATE DE TODOS LOS CAMPOS
    datos = consentimiento.dict()

    for campo, valor in datos.items():
        if hasattr(db_consentimiento, campo):
            setattr(db_consentimiento, campo, valor)

    db_consentimiento.fecha_actualizacion = datetime.utcnow()

    db.commit()
    db.refresh(db_consentimiento)

    return db_consentimiento


# ✅ DELETE
def eliminar_consentimiento(db: Session, consentimiento_id: int):
    db_consentimiento = obtener_consentimiento(db, consentimiento_id)

    if db_consentimiento:
        db.delete(db_consentimiento)
        db.commit()
        return True

    return False
