from datetime import datetime, date
from pydantic import BaseModel, Field

class ConsentimientoBase(BaseModel):
    id_consentimiento: str = Field(..., alias="idConsentimiento")
    email: str
    consentimiento: bool
    archivo: str | None = None
    version: str | None = None
    creado_por: str | None = Field(None, alias="creadoPor")
    actualizado_por: str | None = Field(None, alias="actualizadoPor")
    activo: bool | None = True

    profesional: str | None = Field(None, alias="nombreProfesional")
    email_profesional: str | None = Field(None, alias="emailProfesional")
    instituto: str | None = None
    servicio: str | None = Field(None, alias="codigoServicio")
    lateralidad: str | None = None
    aceptado: bool | None = None
    observaciones: str | None = None
    estado: str | None = Field(None, alias="estadoValidacion")

    fecha_validacion_ia: date | None = Field(None, alias="fechaValidacionIA")
    fecha_reenvio_profesional: date | None = Field(None, alias="fechaReenvioProfesional")
    aceptado_por_profesional: str | None = Field(None, alias="aceptadoPorProfesional")
    idiomas_disponibles: str | None = Field(None, alias="idiomasDisponibles")
    fecha_subida_intranet: date | None = Field(None, alias="fechaSubidaIntranet")
    fecha_disponible_econsentimiento: date | None = Field(None, alias="fechaDisponibleEConsentimiento")
    codigo_econsentimiento: str | None = Field(None, alias="codigoEConsentimiento")
    observaciones_validacion: str | None = Field(None, alias="observacionesValidacion")

    link_consentimiento_definitivo_catala: str | None = Field(None, alias="linkConsentimientoDefinitivoCatala")
    link_consentimiento_definitivo_castellano: str | None = Field(None, alias="linkConsentimientoDefinitivoCastellano")

    nombre_archivo_catalan: str | None = Field(None, alias="nombreArchivoCatalan")
    nombre_archivo_castellano: str | None = Field(None, alias="nombreArchivoCastellano")

    # ✅ NUEVOS
    codigo_interno: str | None = Field(None, alias="codigoConsentimientoInterno")
    nombre_consentimiento: str | None = Field(None, alias="nombreConsentimiento")

    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True


class ConsentimientoCreate(ConsentimientoBase):
    pass


class ConsentimientoResponse(ConsentimientoBase):
    id: int
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None

    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True


class VersionConsentimientoResponse(BaseModel):
    id: int
    consentimiento_id: int
    numero_version: str
    fecha: datetime
    archivo: str | None = None
    creado_por: str | None = Field(None, alias="creadoPor")
    actualizado_por: str | None = Field(None, alias="actualizadoPor")

    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True