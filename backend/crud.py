from sqlalchemy.orm import Session
import models
import schemas

def crear_consentimiento(db: Session, consentimiento: schemas.ConsentimientoCreate):
    db_consentimiento = models.Consentimiento(**consentimiento.dict())
    db.add(db_consentimiento)
    db.commit()
    db.refresh(db_consentimiento)
    return db_consentimiento

def obtener_consentimientos(db: Session):
    return db.query(models.Consentimiento).all()

def obtener_consentimiento(db: Session, consentimiento_id: int):
    return db.query(models.Consentimiento).filter(models.Consentimiento.id == consentimiento_id).first()

def actualizar_consentimiento(db: Session, consentimiento_id: int, consentimiento: schemas.ConsentimientoCreate):
    db_consentimiento = db.query(models.Consentimiento).filter(models.Consentimiento.id == consentimiento_id).first()
    if db_consentimiento:
        db_consentimiento.instituto = consentimiento.instituto
        db_consentimiento.codigo_servicio = consentimiento.codigo_servicio
        db.commit()
        db.refresh(db_consentimiento)
    return db_consentimiento

def eliminar_consentimiento(db: Session, consentimiento_id: int):
    db.query(models.Consentimiento).filter(models.Consentimiento.id == consentimiento_id).delete()
    db.commit()
