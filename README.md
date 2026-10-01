<div align="center">
  <img src="./assets/unid-logo-full.png" alt="UNID - Universidad Interamericana para el Desarrollo" width="280" />
  <h1>Sistema de Auditoría Curricular y Validación de Estadía</h1>
  <p><strong>Universidad Interamericana para el Desarrollo &middot; Coordinación Académica</strong></p>
  <p>Plataforma institucional para el procesamiento dinámico de kárdex, auditoría de trayectorias académicas y emisión automatizada de dictámenes normativos de Estadía Empresarial y Titulación.</p>
</div>

---

## Resumen Ejecutivo

El **Sistema de Auditoría Curricular y Validación de Estadía** es una solución web de nivel institucional concebida para automatizar la revisión de expedientes académicos a partir de los documentos oficiales emitidos por la institución (*Detalle de selección de cursos y estado de cuenta por alumno*).

La herramienta elimina la captura manual, suprime discrepancias de criterio normativo y genera dictámenes inmediatos sobre la elegibilidad del estudiante para cursar su Estadía Empresarial (7.º y 9.º cuatrimestres), así como el cumplimiento de los requisitos de titulación y egreso del Plan 2018.

---

## Especificaciones Funcionales y de Ingeniería

### 1. Motor de Extracción Dinámica de Kárdex (PDF.js)
- **Procesamiento Espacial por Coordenadas**: Análisis directo de los operadores de texto mediante coordenadas horizontales ($X$) y verticales ($Y$), prescindiendo de plantillas rígidas o datos simulados.
- **Segmentación Estricta de Columnas**:
  - `CRN`: Identificador de registro institucional ($X \in [20, 68]$).
  - `SUBJ`: Clave de disciplina académica ($X \in [63, 104]$).
  - `CRSE`: Clave oficial de la asignatura ($X \in [98, 145]$).
  - `PERIODO`: Ciclo lectivo de seis dígitos ($X \in [138, 185]$).
  - `GRDE` / `MODALIDAD`: Calificación final real asociada de forma estricta a tokens de modalidad `RW` (Ordinario) o `RE` (Regularización).
  - **Filtro de Ruido Institucional**: Exclusión automática de calificaciones parciales ($B1, B2, CF, B3, EX, PF$), créditos ($BH$) e identificadores de sede ($CAM$).
- **Normalización de Caracteres OCR**: Corrección algorítmica de artefactos de renderizado del documento oficial (`CFTD8` $\rightarrow$ `CFT08`, `MT 02` $\rightarrow$ `MTS02`, `19/18/17/g/B` $\rightarrow$ `9/8/7/9/8`).
- **Extracción de Identidad del Alumno**: Captura estructurada de Matrícula (8 dígitos), Nombre institucional completo, Sede, Programa académico oficial y Estatus de permanencia (`EG`, `AC`, `BA`, `IN`).

### 2. Matriz de Estados Curriculares
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

### 3. Detección de Desfases y Trazabilidad de Intentos
- Registro cronológico detallado de cada intento por ciclo lectivo, modalidad y calificación obtenida.
- Detección de desfase temporal cuando asignaturas del primer cuatrimestre fueron inscritas de manera extemporánea en periodos posteriores.

### 4. Requisitos de Egreso y Titulación
- **Acreditación de Idioma Inglés**: Seguimiento de los 5 niveles curriculares obligatorios (`LENG-F001` a `LENG-P001`) o validación de exención oficial mediante acreditación global (`LENG-0008` con estatus `AC`).
- **Requisitos Co-Curriculares Obligatorios**: Auditoría de las claves institucionales terminales:
  - `MPD-CMS02`: Ortografía.
  - `MPD-CMS03`: Comprensión Lectora.
  - `CUPR-EGCF1`: Curso de Preparación EGEL I.
  - `TPEG-0001`: Examen General de Egreso de Licenciatura (EGEL).
- **Control de Bloqueo Terminal**: Toda omisión o adeudo en estos requisitos se refleja como causal de retención de titulación.

### 5. Dictamen Normativo de Estadía Empresarial
- **Elegible para Estadía**: El estudiante tiene acreditadas en su totalidad las asignaturas correspondientes del 1.º al 6.º cuatrimestre y mantiene liberados sus prerrequisitos.
- **No Elegible / Retenido**: Presencia de adeudos activos o asignaturas omitidas en el bloque básico o formativo (1.º al 6.º cuatrimestre), o adeudos vigentes en requisitos de titulación.

---

## Módulos y Documentación Oficial

El sistema estructura la salida de auditoría en dos vistas oficiales preparadas para su exportación a PDF:

1. **Hoja 1: Mapa Curricular de Ejecución**:
   - Representación en cuadrícula de los 9 cuatrimestres de la carrera.
   - Franja inferior con los 5 niveles de inglés y los 4 requisitos co-curriculares.
   - Catálogo de electivas multidisciplinares cursadas y disponibles.
   - Panel de trazabilidad interactivo al seleccionar cualquier materia.

2. **Hoja 2: Cédula de Auditoría Académica y Dictamen Oficial**:
   - Cabecera formal con sellos de control institucional y metadatos del estudiante.
   - Banner de dictamen normativo con validez ejecutiva.
   - Tarjetas de balance cuantitativo (asignaturas ordinarias, recursadas, regularizadas, adeudos y omitidas).
   - Bitácora analítica de incidencias con desglose de causas y asignaturas prioritarias de regularización.
   - Cuadro de firmas reglamentarias para Coordinación Académica, Dirección de Sede y Estudiante.

---

## Arquitectura y Stack Tecnológico

- **Interfaz de Usuario**: React 19, Tailwind CSS.
- **Herramientas de Compilación**: Vite 8.
- **Motor de Renderizado PDF**: `pdfjs-dist` (configuración de worker local integrado).
- **Generación de Reportes**: `html2canvas`, `jspdf`.
- **Iconografía Vectorial**: `lucide-react`.
- **Capa de Persistencia**: Neon Serverless PostgreSQL (`@neondatabase/serverless`) con esquema de respaldo estático local.
- **Análisis Estático y Calidad**: `oxlint`.

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
