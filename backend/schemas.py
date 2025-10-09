from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class VersionConsentimientoBase(BaseModel):
    numero_version: int
    archivo: Optional[str] = None
    creado_por: Optional[str] = None
    actualizado_por: Optional[str] = None

class VersionConsentimientoCreate(VersionConsentimientoBase):
    pass

class VersionConsentimiento(VersionConsentimientoBase):
    id: int
    fecha: datetime

    class Config:
        orm_mode = True


class ConsentimientoBase(BaseModel):
    instituto: str
    codigo_servicio: str
    activo: Optional[bool] = True

class ConsentimientoCreate(ConsentimientoBase):
    pass

class Consentimiento(ConsentimientoBase):
    id: int
    versiones: List[VersionConsentimiento] = []

    class Config:
        orm_mode = True
