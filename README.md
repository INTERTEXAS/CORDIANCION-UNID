<div align="center">
  <img src="./assets/unid-logo-full.png" alt="UNID - Universidad Interamericana para el Desarrollo" width="280" />
  <h1>Sistema de Auditoría Curricular y Validación de Estadía</h1>
  <p><strong>Universidad Interamericana para el Desarrollo &middot; Coordinación Académica</strong></p>
  <p>Plataforma institucional de grado ERP para el procesamiento masivo de kárdex, auditoría de trayectorias académicas y emisión automatizada de dictámenes normativos.</p>
</div>

---

## Resumen Ejecutivo

El **Sistema de Auditoría Curricular y Validación de Estadía** es una solución web de nivel corporativo concebida para automatizar la revisión de expedientes académicos a partir de los documentos oficiales emitidos por la institución (*Detalle de selección de cursos y estado de cuenta por alumno*).

La herramienta soporta tanto **auditoría individual** como procesamiento **masivo de generaciones (Batch Processing)**, eliminando la captura manual y suprimiendo discrepancias de criterio normativo. Genera reportes consolidados y dictámenes inmediatos sobre la elegibilidad para la Estadía Empresarial (7.º y 9.º cuatrimestres), requisitos de titulación y egreso del Plan 2018.

---

## Especificaciones Funcionales y de Ingeniería

### 1. Auditoría Consolidada de Grupo (Procesamiento Masivo)
- **Extracción Múltiple**: Procesamiento de reportes masivos (sábanas de grupo) extrayendo la trayectoria de decenas de estudiantes simultáneamente.
- **Directorio ERP Institucional**: Visualización de alta densidad basada en patrones de diseño corporativos (Cinta de Datos, indicadores de estatus planos, tipografía estructurada) para el control rápido del avance de la generación.
- **Integración Neon DB**: Almacenamiento y gestión de los reportes consolidados en bases de datos PostgreSQL serverless, clasificados por ciclo escolar.
- **Sábana Ejecutiva (PDF)**: Generación automática del reporte consolidado de grupo, limpio y adaptado formalmente para impresión.

### 2. Motor de Extracción Dinámica de Kárdex (PDF.js)
- **Procesamiento Espacial por Coordenadas**: Análisis directo de los operadores de texto mediante coordenadas $X$ e $Y$.
- **Segmentación Estricta de Columnas**:
  - `CRN`, `SUBJ`, `CRSE`, `PERIODO`, `GRDE` / `MODALIDAD`.
  - **Filtro de Ruido Institucional**: Exclusión automática de calificaciones parciales, créditos y sede.
- **Normalización de Caracteres OCR**: Corrección algorítmica de artefactos de renderizado.
- **Extracción de Identidad del Alumno**: Captura estructurada de Matrícula, Nombre, Sede, Programa y Estatus de permanencia.

### 3. Matriz de Estados Curriculares
El motor clasifica cada una de las asignaturas del mapa curricular oficial bajo los siguientes criterios normativos:

| Código | Denominación Institucional | Criterio de Clasificación |
| :--- | :--- | :--- |
| **ORD** | 1.ª Oportunidad Ordinaria | Aprobada en el primer intento registrado mediante modalidad `RW`. |
| **REC** | Recursamiento Acreditado | Aprobada tras cursar dos o más intentos académicos. |
| **RE** | Regularización / Extraordinario | Acreditada mediante examen extraordinario o modalidad `RE`. |
| **CURS** | En Curso Activo | Asignatura registrada en el ciclo vigente sin calificación numérica final. |
| **REC · CURSO** | Recursamiento en Curso | Asignatura en curso activo que cuenta con reprobaciones previas. |
| **ADEUDO** | Reprobada Activa | Último intento registrado con calificación inferior a 6.0, `NP` o `NA`. |
| **OMITIDA** | Asignatura No Cursada | Materia perteneciente a ciclos anteriores al nivel actual que no registra inscripción. |
| **PEND.** | Pendiente Curricular | Asignatura programada para cuatrimestres futuros. |

### 4. Detección de Desfases y Requisitos de Titulación
- Registro cronológico detallado de intentos y detección de desfases temporales.
- **Acreditación de Inglés**: Seguimiento de los 5 niveles obligatorios o exención global (`LENG-0008`).
- **Requisitos Co-Curriculares**: Auditoría de claves terminales (`MPD-CMS02`, `MPD-CMS03`, `CUPR-EGCF1`, `TPEG-0001`).

### 5. Dictamen Normativo de Estadía Empresarial
- **Elegible para Estadía**: Asignaturas 1.º a 6.º acreditadas y prerrequisitos liberados.
- **No Elegible / Retenido**: Presencia de adeudos o materias omitidas en bloque básico/formativo.

---

## Módulos y Vistas Oficiales

El sistema estructura la salida de auditoría en interfaces modulares planas y estructuradas, optimizadas para impresión:

1. **Auditoría de Grupo**: Directorio consolidado con indicadores de estado y gestión en la nube (Neon).
2. **Hoja 1: Mapa Curricular de Ejecución**: Representación en cuadrícula de 9 cuatrimestres, inglés, requisitos y catálogo de electivas multidisciplinares.
3. **Hoja 2: Cédula de Auditoría Académica**: Formato oficial para impresión con tarjetas de balance cuantitativo, bitácora analítica y cuadro de firmas.

---

## Arquitectura y Stack Tecnológico

- **Interfaz de Usuario**: React 19, Tailwind CSS (Patrones ERP / Estructurales).
- **Herramientas de Compilación**: Vite 8.
- **Motor de Renderizado PDF**: `pdfjs-dist` (configuración de worker local integrado).
- **Generación de Reportes**: `html2canvas`, `jspdf`.
- **Capa de Persistencia**: Neon Serverless PostgreSQL (`@neondatabase/serverless`).
- **Iconografía Vectorial**: `lucide-react`.

---

## Instalación y Configuración Local

### Prerrequisitos
- Node.js versión 18.0.0 o superior.
- Gestor de paquetes npm.

### Instrucciones
1. Clonar el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Cordinacion-UNID
   ```

2. Instalar dependencias del proyecto:
   ```bash
   npm install
   ```

3. Iniciar el entorno de desarrollo:
   ```bash
   npm run dev
   ```

4. Generar la compilación para producción:
   ```bash
   npm run build
   ```

---

## Despliegue en Vercel

El proyecto dispone del archivo de configuración `vercel.json` para gestionar el enrutamiento de la aplicación de una sola página (SPA):

- **Plataforma**: Vercel
- **Preajuste de Framework**: Vite
- **Comando de Compilación**: `npm run build`
- **Directorio de Salida**: `dist`
- **Comando de Instalación**: `npm install`

---

<div align="center">
  <img src="./assets/malz-dev-signature.png" alt="MALZ.DEV" width="140" />
  <br />
  <sub>Diseño y Desarrollo de Software &middot; MALZ.DEV &alpha;</sub>
</div>
