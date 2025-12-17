# backend/routers/importar_excel.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from io import BytesIO, StringIO
from database import SessionLocal
import models
import traceback
import re
from datetime import datetime

router = APIRouter(
    prefix="/api",
    tags=["Importar Excel"]
)

# Normaliza nombres de columnas a snake_case
def normalize_col_name(name: str) -> str:
    if name is None:
        return ""
    s = name.strip()
    s = re.sub(r"[ \.\-]+", "_", s)
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s)
    return s.lower()

# Convierte texto a booleano
def parse_bool(v) -> bool:
    if v is None:
        return False
    if isinstance(v, bool):
        return v
    s = str(v).strip().lower()
    return s in {"1", "true", "t", "yes", "y", "si", "sí", "s"}

@router.post("/importar_excel/")
async def importar_excel(file: UploadFile = File(...)):
    # Validar extensión
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="El archivo debe ser .xlsx, .xls o .csv")

    contents = await file.read()

    try:
        # Leer Excel o CSV
        try:
            df = pd.read_excel(BytesIO(contents))
        except Exception:
            try:
                df = pd.read_csv(StringIO(contents.decode("utf-8")))
            except Exception as e_csv:
                raise HTTPException(status_code=400, detail=f"No se pudo leer el archivo como Excel o CSV: {e_csv}")

        # Normalizar encabezados
        df.columns = [normalize_col_name(col) for col in df.columns]

        # Columnas obligatorias
        columnas_requeridas = {"id_consentimiento", "email", "consentimiento"}
        if not columnas_requeridas.issubset(set(df.columns)):
            faltantes = columnas_requeridas - set(df.columns)
            raise HTTPException(
                status_code=400,
                detail=f"Faltan columnas requeridas en el Excel: {', '.join(faltantes)}"
            )

        # Filtrar filas vacías
        df = df.dropna(subset=["id_consentimiento", "email"], how="any")

        if df.empty:
            raise HTTPException(status_code=400, detail="No hay filas válidas para importar.")

        # Tomar SOLO la primera fila válida
        row = df.iloc[0]

        db: Session = SessionLocal()

        # Evitar duplicados
        existe = db.query(models.Consentimiento).filter(
            models.Consentimiento.id_consentimiento == str(row["id_consentimiento"])
        ).first()

        if existe:
            db.close()
            return {"mensaje": "⚠️ Registro ya existe y no se importó."}

        # Campos opcionales
        archivo_val = row.get("archivo") if "archivo" in row and not pd.isna(row.get("archivo")) else None
        version_val = row.get("version") if "version" in row and not pd.isna(row.get("version")) else None
        profesional_val = row.get("profesional") if "profesional" in row and not pd.isna(row.get("profesional")) else None
        email_prof_val = row.get("email_profesional") if "email_profesional" in row and not pd.isna(row.get("email_profesional")) else None
        instituto_val = row.get("instituto") if "instituto" in row and not pd.isna(row.get("instituto")) else None
        servicio_val = row.get("servicio") if "servicio" in row and not pd.isna(row.get("servicio")) else None
        lateralidad_val = row.get("lateralidad") if "lateralidad" in row and not pd.isna(row.get("lateralidad")) else None
        aceptado_val = parse_bool(row.get("aceptado")) if "aceptado" in row else False
        observaciones_val = row.get("observaciones") if "observaciones" in row and not pd.isna(row.get("observaciones")) else None
        estado_val = row.get("estado") if "estado" in row and not pd.isna(row.get("estado")) else "pendiente"
        estado_validacion_val = row.get("estadovalidacion") if "estadovalidacion" in row and not pd.isna(row.get("estadovalidacion")) else "pendiente"

        nuevo = models.Consentimiento(
            id_consentimiento=str(row["id_consentimiento"]),
            email=str(row["email"]),
            consentimiento=parse_bool(row["consentimiento"]),
            archivo=str(archivo_val) if archivo_val else None,
            version=str(version_val) if version_val else None,
            creado_por="import_excel",
            actualizado_por="import_excel",
            activo=True,
            profesional=str(profesional_val) if profesional_val else None,
            email_profesional=str(email_prof_val) if email_prof_val else None,
            instituto=str(instituto_val) if instituto_val else None,
            servicio=str(servicio_val) if servicio_val else None,
            lateralidad=str(lateralidad_val) if lateralidad_val else None,
            aceptado=aceptado_val,
            observaciones=str(observaciones_val) if observaciones_val else None,
            estado=str(estado_val),
            estadovalidacion=str(estado_validacion_val),
            fecha_creacion=datetime.now(),
            fecha_actualizacion=datetime.now()
        )

        db.add(nuevo)
        db.commit()
        db.close()

        return {"mensaje": "✅ Registro importado correctamente (solo 1 fila)."}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
