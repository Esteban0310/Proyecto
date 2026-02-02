# ============================================
# 📁 RUTA: backend/routers/importar_excel.py
# VERSIÓN CORREGIDA Y ESTABLE
# ============================================

from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from io import BytesIO, StringIO
from database import SessionLocal
import models
import traceback
import re
import unicodedata
from datetime import datetime

router = APIRouter(
    prefix="/api",
    tags=["Importar Excel"]
)

# ----------------------------
# Normalizar nombres de columnas
# ----------------------------
def normalize_col_name(name: str) -> str:
    if not name:
        return ""
    name = ''.join(
        c for c in unicodedata.normalize('NFD', name)
        if unicodedata.category(c) != 'Mn'
    )
    name = re.sub(r"[ \.\-]+", "_", name)
    name = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", name)
    return name.lower().strip()

# ----------------------------
# Convertir valores a boolean
# ----------------------------
def parse_bool(v) -> bool:
    if v is None:
        return False
    if isinstance(v, bool):
        return v
    s = str(v).strip().lower()
    return s in {"1", "true", "t", "yes", "y", "si", "sí", "s"}

# ----------------------------
# Endpoint importar Excel
# ----------------------------
@router.post("/importar_excel/")
async def importar_excel(file: UploadFile = File(...)):

    if not file.filename.lower().endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser .xlsx, .xls o .csv"
        )

    contents = await file.read()

    try:
        # Leer archivo
        try:
            df = pd.read_excel(BytesIO(contents))
        except Exception:
            try:
                df = pd.read_csv(StringIO(contents.decode("utf-8")))
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"No se pudo leer el archivo: {e}"
                )

        # DEBUG columnas originales
        print("=" * 50)
        print("🔍 COLUMNAS ORIGINALES:")
        print(df.columns.tolist())
        print("=" * 50)

        # Normalizar columnas
        originales = df.columns.tolist()
        df.columns = [normalize_col_name(c) for c in df.columns]

        print("🔍 COLUMNAS NORMALIZADAS:")
        for o, n in zip(originales, df.columns.tolist()):
            print(f"  '{o}' → '{n}'")
        print("=" * 50)

        # Validación de columnas obligatorias
        columnas_requeridas = {"id_consentimiento", "email", "consentimiento"}
        columnas_encontradas = set(df.columns)

        print("✅ COLUMNAS ENCONTRADAS:", columnas_encontradas)
        print("📋 COLUMNAS REQUERIDAS:", columnas_requeridas)

        if not columnas_requeridas.issubset(columnas_encontradas):
            faltantes = columnas_requeridas - columnas_encontradas
            raise HTTPException(
                status_code=400,
                detail=f"Faltan columnas requeridas: {', '.join(faltantes)}"
            )

        # Eliminar filas vacías
        df = df.dropna(subset=["id_consentimiento", "email"], how="any")
        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="No hay filas válidas para importar"
            )

        db: Session = SessionLocal()
        filas_importadas = 0
        filas_saltadas = 0

        for _, row in df.iterrows():

            # Evitar duplicados
            existe = db.query(models.Consentimiento).filter(
                models.Consentimiento.id_consentimiento == str(row["id_consentimiento"])
            ).first()

            if existe:
                filas_saltadas += 1
                continue

            # CREACION CORRECTO DE LAS TABLAS DEL CONSENTIEMIENTO 
            nuevo = models.Consentimiento(
                id_consentimiento=str(row["id_consentimiento"]),
                email=str(row["email"]),
                consentimiento=parse_bool(row["consentimiento"]),

                archivo=str(row.get("archivo")) if "archivo" in row and not pd.isna(row.get("archivo")) else None,
                version=str(row.get("version")) if "version" in row and not pd.isna(row.get("version")) else "V.1",

                creado_por="import_excel",
                actualizado_por="import_excel",
                activo=True,

                # 🔹 MAPEOS CORRECTOS PARA LA TABLE DEL USUARIO 
                profesional=str(row.get("nombre_profesional")) if "nombre_profesional" in row and not pd.isna(row.get("nombre_profesional")) else None,
                email_profesional=str(row.get("email_profesional")) if "email_profesional" in row and not pd.isna(row.get("email_profesional")) else None,
                instituto=str(row.get("instituto")) if "instituto" in row and not pd.isna(row.get("instituto")) else None,
                servicio=str(row.get("codigo_servicio")) if "codigo_servicio" in row and not pd.isna(row.get("codigo_servicio")) else None,
                lateralidad=str(row.get("lateralidad")) if "lateralidad" in row and not pd.isna(row.get("lateralidad")) else None,
                aceptado=parse_bool(row.get("aceptado")) if "aceptado" in row else False,
                observaciones=str(row.get("observaciones")) if "observaciones" in row and not pd.isna(row.get("observaciones")) else None,
                estado=str(row.get("estado_validacion")) if "estado_validacion" in row and not pd.isna(row.get("estado_validacion")) else "pendiente",

                fecha_creacion=datetime.now(),
                fecha_actualizacion=datetime.now()
            )

            db.add(nuevo)
            filas_importadas += 1

        db.commit()
        db.close()

        mensaje = f"✅ Importadas {filas_importadas} fila(s)."
        if filas_saltadas > 0:
            mensaje += f" ⚠️ Saltadas {filas_saltadas} duplicadas."

        print("✅ IMPORTACIÓN FINALIZADA")
        print("=" * 50)

        return {"mensaje": mensaje}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
