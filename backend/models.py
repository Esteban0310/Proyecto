from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import database

class Consentimiento(database.Base):
    __tablename__ = "consentimientos"

    id = Column(Integer, primary_key=True, index=True)
    id_consentimiento = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    consentimiento = Column(Boolean, default=False)
    archivo = Column(String(255))
    version = Column(String(50))
    creado_por = Column(String(100))
    actualizado_por = Column(String(100))
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    activo = Column(Boolean, default=True)

    # Campos opcionales existentes
    profesional = Column(String(150), nullable=True)
    email_profesional = Column(String(150), nullable=True)
    instituto = Column(String(150), nullable=True)
    servicio = Column(String(150), nullable=True)
    lateralidad = Column(String(100), nullable=True)
    aceptado = Column(Boolean, default=False)
    observaciones = Column(String(255), nullable=True)
    estado = Column(String(100), default="pendiente")

    # ✅ NUEVOS CAMPOS DE VALIDACIÓN   
    fecha_validacion_ia = Column(Date, nullable=True)
    fecha_reenvio_profesional = Column(Date, nullable=True)
    aceptado_por_profesional = Column(String(20), nullable=True)
    idiomas_disponibles = Column(String(20), nullable=True)
    fecha_subida_intranet = Column(Date, nullable=True)
    fecha_disponible_econsentimiento = Column(Date, nullable=True)
    codigo_econsentimiento = Column(String(100), nullable=True)
    observaciones_validacion = Column(Text, nullable=True)

    # ✅ NUEVOS CAMPOS DE LINKS
    link_consentimiento_definitivo_catala = Column(String(500), nullable=True)
    link_consentimiento_definitivo_castellano = Column(String(500), nullable=True)

    versiones = relationship("VersionConsentimiento", back_populates="consentimiento", cascade="all, delete-orphan")


class VersionConsentimiento(database.Base):
    __tablename__ = "versiones_consentimiento"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consentimiento_id = Column(Integer, ForeignKey("consentimientos.id"), nullable=False)
    numero_version = Column(String(50), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    archivo = Column(String(255))
    creado_por = Column(String(100))
    actualizado_por = Column(String(100))

    consentimiento = relationship("Consentimiento", back_populates="versiones")