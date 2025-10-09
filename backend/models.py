from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import database

class Consentimiento(database.Base):
    __tablename__ = "consentimientos"
    id = Column(Integer, primary_key=True, index=True)
    instituto = Column(String(100), nullable=False)
    codigo_servicio = Column(String(50), nullable=False)
    activo = Column(Boolean, default=True)
    versiones = relationship("VersionConsentimiento", back_populates="consentimiento")


class VersionConsentimiento(database.Base):
    __tablename__ = "versiones_consentimiento"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consentimiento_id = Column(Integer, ForeignKey("consentimientos.id"))
    numero_version = Column(Integer, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    archivo = Column(String(255))
    creado_por = Column(String(100))
    actualizado_por = Column(String(100))
    consentimiento = relationship("Consentimiento", back_populates="versiones")
