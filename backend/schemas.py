from datetime import datetime
from pydantic import BaseModel, Field

# ---------- BASE ----------
class ConsentimientoBase(BaseModel):
    id_consentimiento: str = Field(..., alias="idConsentimiento")
    email: str
    consentimiento: bool
    archivo: str | None = None
    version: str | None = None
    creado_por: str | None = Field(None, alias="creadoPor")
    actualizado_por: str | None = Field(None, alias="actualizadoPor")
    activo: bool | None = True

    # 🔹 Nuevos campos (opcionales)
    profesional: str | None = None
    email_profesional: str | None = Field(None, alias="emailProfesional")
    instituto: str | None = None
    servicio: str | None = None
    lateralidad: str | None = None
    aceptado: bool | None = None
    observaciones: str | None = None
    estado: str | None = None

    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True
        
# ---------- CREATE ----------
class ConsentimientoCreate(ConsentimientoBase):
    pass

# ---------- RESPONSE ----------
class ConsentimientoResponse(ConsentimientoBase):
    id: int
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None

    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True


# ---------- VERSION ----------
class VersionConsentimientoResponse(BaseModel):
    id: int
    consentimiento_id: int
    numero_version: int
    fecha: datetime
    archivo: str | None = None
    creado_por: str | None = Field(None, alias="creadoPor")
    actualizado_por: str | None = Field(None, alias="actualizadoPor")

    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True
