from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database
import crud
import schemas

router = APIRouter(
    prefix="/api/consentimientos",
    tags=["Consentimientos"]
)

@router.post("/", response_model=schemas.ConsentimientoResponse)
def crear_consentimiento(consentimiento: schemas.ConsentimientoCreate, db: Session = Depends(database.get_db)):
    return crud.crear_consentimiento(db, consentimiento)

@router.get("/", response_model=list[schemas.ConsentimientoResponse])
def listar_consentimientos(db: Session = Depends(database.get_db)):
    return crud.obtener_consentimientos(db)

@router.get("/{consentimiento_id}", response_model=schemas.ConsentimientoResponse)
def obtener_consentimiento(consentimiento_id: int, db: Session = Depends(database.get_db)):
    db_consentimiento = crud.obtener_consentimiento(db, consentimiento_id)
    if db_consentimiento is None:
        raise HTTPException(status_code=404, detail="Consentimiento no encontrado")
    return db_consentimiento

@router.put("/{consentimiento_id}", response_model=schemas.ConsentimientoResponse)
def actualizar_consentimiento(consentimiento_id: int, consentimiento: schemas.ConsentimientoCreate, db: Session = Depends(database.get_db)):
    actualizado = crud.actualizar_consentimiento(db, consentimiento_id, consentimiento)
    if not actualizado:
        raise HTTPException(status_code=404, detail="Consentimiento no encontrado")
    return actualizado

@router.delete("/{consentimiento_id}")
def eliminar_consentimiento(consentimiento_id: int, db: Session = Depends(database.get_db)):
    crud.eliminar_consentimiento(db, consentimiento_id)
    return {"message": "Consentimiento eliminado correctamente"}
