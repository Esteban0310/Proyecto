# backend/routers/importar_excel.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from io import BytesIO, StringIO
from database import SessionLocal
import models
import traceback
import re

router = APIRouter(
    prefix="/api",
    tags=["Importar Excel"]
)

# 🧰 Normaliza los nombres de columnas a snake_case
def normalize_col_name(name: str) -> str:
    if name is None:
        return ""
    s = name.strip()
    s = re.sub(r"[ \.\-]+", "_", s)
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s)
    return s.lower()

# 🧰 Convierte texto a booleano
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
        # Intentar leer como Excel
        try:
            df = pd.read_excel(BytesIO(contents))
        except Exception:
            # Si no es Excel válido, intentar como CSV
            try:
                df = pd.read_csv(StringIO(contents.decode("utf-8")))
            except Exception as e_csv:
                raise HTTPException(status_code=400, detail=f"No se pudo leer el archivo como Excel o CSV: {e_csv}")

        # Normalizar encabezados
        original_columns = list(df.columns)
        mapped = {col: normalize_col_name(str(col)) for col in original_columns}
        df = df.rename(columns=mapped)

        # Columnas requeridas
        columnas_requeridas = {"id_consentimiento", "email", "consentimiento"}
        if not columnas_requeridas.issubset(set(df.columns)):
            faltantes = columnas_requeridas - set(df.columns)
            raise HTTPException(
                status_code=400,
                detail=f"Faltan columnas requeridas en el Excel: {', '.join(faltantes)}. "
                       f"Encabezados detectados: {', '.join(df.columns)}"
            )

        db: Session = SessionLocal()
        insertados = 0
        saltadas = 0

        for idx, row in df.iterrows():
            if row.isnull().all():
                saltadas += 1
                continue

            try:
                id_consent = row.get("id_consentimiento") or row.get("idconsentimiento")
                email = row.get("email")
                if pd.isna(id_consent) or pd.isna(email):
                    print(f"⚠️ Saltando fila {idx}: falta id_consentimiento o email. Valores: {row.to_dict()}")
                    saltadas += 1
                    continue

                consentimiento_val = parse_bool(row.get("consentimiento"))
                archivo_val = row.get("archivo") if not pd.isna(row.get("archivo")) else None
                version_val = row.get("version") if not pd.isna(row.get("version")) else None

                nuevo = models.Consentimiento(
                    id_consentimiento=str(id_consent),
                    email=str(email),
                    consentimiento=consentimiento_val,
                    archivo=str(archivo_val) if archivo_val is not None else None,
                    version=str(version_val) if version_val is not None else None,
                    creado_por="import_excel",
                    actualizado_por="import_excel",
                    activo=True
                )

                db.add(nuevo)
                insertados += 1

            except Exception as fila_err:
                print(f"⚠️ Error procesando fila {idx}: {fila_err}")
                print("Fila:", row.to_dict())
                traceback.print_exc()
                saltadas += 1
                continue

        db.commit()
        db.close()

        return {
            "mensaje": f"✅ Se importaron {insertados} registros correctamente.",
            "filas_saltadas": saltadas
        }

    except HTTPException:
        raise
    except Exception as e:
        print("❌ ERROR AL IMPORTAR EXCEL:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
