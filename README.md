
## 🧩 1. Descripción general

Este proyecto es una **aplicación web full-stack** que gestiona documentos o consentimientos médicos, permitiendo:

* Registrar, listar y versionar consentimientos.
* Importar y exportar registros desde/hacia archivos Excel o CSV.
* Controlar los accesos desde un panel web con autenticación básica.
* Usar Docker para desplegar rápidamente todos los servicios.

> Es ideal para entornos hospitalarios, administrativos o académicos donde se requiere control documental auditable.

## 🎯 2. Objetivos del sistema

* Centralizar la gestión de consentimientos en una sola plataforma.
* Facilitar el control de versiones, usuarios y trazabilidad.
* Permitir importación masiva de datos desde hojas de cálculo.
* Brindar una interfaz moderna y fácil de usar.

## ⚙️ 3. Características principales

* **Frontend Angular**: interfaz modular, adaptable, basada en componentes (`formulario`, `login`, `admin`, etc.).
* **Backend Python (FastAPI)**: API REST completa con rutas organizadas por módulos (`consentimientos`, `versiones`, `importar_excel`).
* **Integración con Excel**: importar y exportar archivos con validación de columnas.
* **Auditoría**: campos de control (`fecha`, `creado_por`, `actualizado_por`, `numero_version`).
* **Despliegue fácil**: contenedores con Docker Compose.
* **Compatibilidad CORS**: comunicación entre frontend y backend configurada.

## 🏗️ 4. Arquitectura general

```
┌───────────────────────┐       ┌────────────────────────┐
│  Angular Frontend     │ <---->│  FastAPI Backend        │ <----> Base de Datos (PostgreSQL)
└───────────────────────┘       └────────────────────────┘
        │ Dockerfile                     │ Dockerfile
        └────────────── docker-compose.yml ───────────────┘
```

## 💻 5. Tecnologías usadas

| Tipo                        | Tecnología                               |
| --------------------------- | ---------------------------------------- |
| **Frontend**                | Angular 16+, TypeScript, RxJS, HTML, CSS |
| **Backend**                 | Python 3.10+, FastAPI, SQLAlchemy        |
| **Base de datos**           | PostgreSQL                               |
| **Contenedores**            | Docker, Docker Compose                   |
| **Importación/Exportación** | Pandas, openpyxl                         |
| **Infraestructura**         | Nginx (opcional), REST API               |

## 📂 6. Estructura del proyecto

```
Proyecto-main/
├─ backend/
│  ├─ main.py
│  ├─ crud.py
│  ├─ database.py
│  ├─ models.py
│  ├─ routers/
│  │  ├─ consentimientos.py
│  │  ├─ importar_excel.py
│  │  └─ versiones.py
│  └─ Dockerfile
├─ panel-doctor/
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ components/
│  │  │  │  ├─ formulario-component/
│  │  │  │  ├─ login-component/
│  │  │  │  └─ admin-component/
│  │  │  ├─ app.module.ts
│  │  │  └─ app.component.ts
│  ├─ package.json
│  └─ Dockerfile
├─ docker-compose.yml
└─ README.md
```

## 🧱 7. Requisitos previos

* **Docker y Docker Compose** (recomendado)
* Node.js 18+ (para desarrollo frontend local)
* Python 3.10+ y `pip` (para desarrollo backend local)
* Git (para clonar el repositorio)

## 🚀 8. Instalación y ejecución con Docker

```bash
# Clonar el repositorio
git clone <URL_DEL_REPO>
cd Proyecto-main

# Construir y ejecutar servicios
docker compose up --build -d
```

Una vez levantado:

* Frontend disponible en: `http://localhost:4200`
* API disponible en: `http://localhost:8000/api`

### Detener servicios

```bash
docker compose down
```

## ⚡ 9. Ejecución local sin Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd panel-doctor
npm install
npm start
```

Abrir `http://localhost:4200`.

## 🔑 10. Variables de entorno

Crea un archivo `.env` en la raíz del backend:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/proyecto
SECRET_KEY=clave_super_segura
CORS_ORIGINS=http://localhost:4200
```

## 🗃️ 11. Base de datos y migraciones

* ORM: SQLAlchemy
* Migraciones (si usas Alembic):

```bash
alembic upgrade head
```

## 🧩 12. API REST — Endpoints principales

| Método | Ruta                          | Descripción                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/consentimientos`        | Lista de consentimientos     |
| POST   | `/api/consentimientos`        | Crear nuevo consentimiento   |
| GET    | `/api/consentimientos/{id}`   | Detalle de un consentimiento |
| PUT    | `/api/consentimientos/{id}`   | Actualizar                   |
| DELETE | `/api/consentimientos/{id}`   | Eliminar                     |
| POST   | `/api/consentimientos/import` | Importar desde Excel/CSV     |
| GET    | `/api/consentimientos/export` | Exportar consentimientos     |

## 📤 13. Importar / Exportar (Excel)

Funcionalidad implementada en `routers/importar_excel.py`.

### Ejemplo de importación (cURL)

```bash
curl -X POST http://localhost:8000/api/consentimientos/import \
  -F "file=@consentimientos.xlsx"
```

El backend procesa el archivo y devuelve un resumen de filas importadas.

### Ejemplo de exportación

```bash
curl -O http://localhost:8000/api/consentimientos/export
```

## 🧰 14. Solución de problemas comunes

### CORS bloqueado

Agrega al backend:

```py
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:4200"],
  allow_methods=["*"],
  allow_headers=["*"])
```

### Docker espera base de datos

Asegúrate de que el servicio `db` esté incluido y use `depends_on`.

### Advertencia "version obsolete" en docker-compose

Eliminar la línea `version:` al inicio del archivo.

## 🖼️ 15. Capturas de pantalla (sugerido)

Puedes añadir imágenes del panel en la carpeta `/docs/screenshots/`:

```
![Pantalla principal](docs/screenshots/dashboard.png)
![Formulario](docs/screenshots/formulario.png)
```

## 🤝 16. Cómo contribuir

1. Crea una rama nueva: `git checkout -b feature/nueva-funcionalidad`
2. Realiza cambios con commits pequeños y claros.
3. Haz un Pull Request hacia `main`.

## 🧭 17. Buenas prácticas

* Mantén sincronía entre los modelos del backend y las interfaces de Angular.
* Usa `env` para configuración en lugar de valores fijos.
* Documenta rutas con OpenAPI (`/docs`).
* Usa validaciones Pydantic para datos de entrada.

## 👤 18. Autor y contacto

**Autor:** Juan Esteban Rojas Chávez
**Email:** [test@gmail.com](mailto:test@gmail.com)
**Repositorio:** *(añadir URL de GitHub o GitLab)*

## ⚖️ 19. Licencia

Este proyecto no incluye una licencia explícita. Puedes agregar una de las siguientes:

* MIT — Permite uso libre con atribución.
* Apache 2.0 — Para proyectos empresariales.
* GPL 3.0 — Para software libre con derivaciones abiertas.

---

✨ **Consejo final:** este README está listo para entregarse a un tutor o subirlo a GitHub.  Incluye toda la documentación técnica, guía de instalación y contexto funcional. Si lo deseas, puedo generar también la versión en inglés o incluir ejemplos de respuesta JSON de la API.
