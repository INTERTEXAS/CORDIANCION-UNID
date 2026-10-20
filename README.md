<div align="center">
  <img src="./assets/unid-logo-full.png" alt="UNID - Universidad Interamericana para el Desarrollo" width="280" />
  <h1>Sistema de Auditoría Curricular y Validación de Estadía</h1>
  <p><strong>Universidad Interamericana para el Desarrollo &middot; Coordinación Académica</strong></p>
  <p>Plataforma institucional de grado ERP para el procesamiento de kárdex, auditoría de trayectorias académicas, persistencia en la nube y emisión automatizada de dictámenes normativos.</p>
</div>

---

## Resumen Ejecutivo

El **Sistema de Auditoría Curricular y Validación de Estadía** es una plataforma web institucional concebida para automatizar el análisis integral de expedientes académicos a partir de los documentos oficiales emitidos por el sistema institucional (*Detalle de selección de cursos y estado de cuenta por alumno*).

La solución permite auditar expedientes tanto de forma individual como mediante **procesamiento masivo por generaciones (Batch Processing)**. Suprime por completo la captura manual de calificaciones y homologa los criterios de dictamen normativo para:
- Elegibilidad para Estadía Empresarial (7.º y 9.º cuatrimestres).
- Verificación de avance crediticio y asignaturas acreditadas vs. adeudadas.
- Cumplimiento de los 5 niveles obligatorios de idioma inglés o acreditación global.
- Requisitos co-curriculares, talleres de titulación y examen EGEL.

---

## Módulos y Capacidades del Sistema

### 1. Seguridad, Control de Acceso y Sesión Institucional
- **Autenticación con Microsoft Entra ID (Azure AD)**: Integración oficial mediante `@azure/msal-browser` y `@azure/msal-react` con inquilino institucional único (Single Tenant).
- **Restricción Estricta de Dominio `@unid.mx`**: La barrera de seguridad (`AuthBarrier`) inspecciona los tokens emitidos y deniega el acceso a cualquier cuenta que no pertenezca explícitamente al dominio institucional `@unid.mx`.
- **Puente OAuth de Cierre Automático**: Comunicación entre ventana emergente y ventana principal basada en `broadcastResponseToMainFrame` (`BroadcastChannel`), garantizando el cierre instantáneo de la ventana emergente tras seleccionar la cuenta (sea exitosa o rechazada) sin montar la aplicación en dicha ventana.
- **Temporizador de Inactividad Institucional**: Cierre automático de sesión tras 5 minutos de inactividad del usuario para proteger expedientes en computadoras compartidas o de oficina.
- **Acceso Especial de Super Administrador / Desarrollador**: Modal de mantenimiento (`DevLoginModal`) con credenciales seguras para labores técnicas, auditoría de base de datos y depuración, exento del límite de inactividad.

### 2. Motor de Extracción y Análisis de Kárdex (PDF.js)
- **Extracción de Coordenadas Espaciales**: Lectura directa de operadores de texto en PDF mediante coordenadas analíticas, sin depender de OCR susceptible a fallos.
- **Detección Automática de Modalidad**: Identificación algorítmica de la modalidad del estudiante (Escolarizada o No Escolarizada / Ejecutiva) a partir del contenido del documento.
- **Segmentación Estricta de Campos Banner**:
  - Asignatura, clave de materia (`SUBJ` / `CRSE`), código CRN, periodo cursado, calificación numérica y modalidad de acreditación.
  - Exclusión automática de ruido institucional (calificaciones parciales sin valor final, leyendas administrativas).
- **Detección de Desfase de Programas**: Modal interactivo que alerta al usuario si el kárdex cargado pertenece a un programa académico distinto al seleccionado en la vista, permitiendo la reconfiguración inmediata del entorno con un solo clic.

### 3. Persistencia en la Nube (Neon Serverless PostgreSQL)
- **Base de Datos Serverless en la Nube**: Almacenamiento estructurado mediante Neon PostgreSQL y conexión optimizada por pooler (`@neondatabase/serverless`).
- **Gestión por Ciclos Escolares**: Organización y persistencia de lotes completos de alumnos clasificados por ciclo escolar y cuatrimestre.
- **Operaciones de Lote**: Guardado masivo, consulta histórica, visualización detallada y depuración/eliminación granular de ciclos escolares registrados.
- **Contingencia Local**: Si la conexión remota no estuviera disponible, el sistema mantiene la operación local en memoria sin interrumpir el trabajo de coordinación.

### 4. Catálogo de Programas Académicos (14 Programas)
El sistema integra y sincroniza 14 programas institucionales organizados por coordinación:

**Coordinación: Laura Angélica Ara Angulo (Ciencias Económico-Administrativas)**
1. **LIC-COFI-18**: Licenciatura en Contabilidad y Finanzas (Mixto) - Federal
2. **LIC-DAEM-18**: Licenciatura en Administración y Dirección Empresarial - Plan 2018 Dual
3. **LIC-EJCO-17**: Licenciatura en Contabilidad Financiera - Plan 202160 Ejecutivo Modular

**Coordinación: Yessica Inurreta Pavón (Arquitectura, Derecho, Educación y Deporte)**
4. **LIC-ARQU-18**: Licenciatura en Arquitectura (Mixto) - Federal
5. **LIC-DERE-18**: Licenciatura en Derecho y Ciencias Jurídicas (Mixto) - Federal
6. **LIC-EJDE-17**: Licenciatura Ejecutiva en Derecho (Modular) - Federal
7. **LIC-EJED-17**: Licenciatura Ejecutiva en Educación y Tecnologías para el Aprendizaje (Modular) - Federal
8. **LIC-EDFI-18**: Licenciatura en Educación Física, Recreación y Deporte (Mixto) - Federal

**Coordinación: Avelina García Romeo (Diseño, Administración, Mercadotecnia e Ingeniería)**
9. **LIC-DSGD-18**: Licenciatura en Diseño Gráfico Digital (Mixto) - Federal
10. **LIC-EJAD-17**: Licenciatura en Administración de Empresas (Mixto) - Federal
11. **LIC-MEES-18**: Licenciatura en Mercadotecnia Estratégica (Mixto) - Federal
12. **LIC-SYSC-18**: Licenciatura en Ingeniería de Software y Sistemas Computacionales (Mixto) - Federal
13. **LIC-ADME-18**: Licenciatura en Administración Empresarial (Mixto) - Federal

**Programa adicional sin coordinación asignada**
14. **LIC-CTCO-18**: Licenciatura en Ciencias y Técnicas de la Comunicación (Mixto) - Federal

---

## Matriz de Estados Curriculares Normativos

Cada asignatura identificada en el mapa curricular oficial se dictamina bajo la siguiente matriz de estados:

| Código | Denominación Institucional | Criterio de Clasificación |
| :--- | :--- | :--- |
| **ORD** | 1.ª Oportunidad Ordinaria | Asignatura aprobada en su primera inscripción formal. |
| **REC** | Recursamiento Acreditado | Asignatura aprobada tras dos o más periodos cursados. |
| **RE** | Regularización / Extraordinario | Asignatura acreditada mediante evaluación extraordinaria. |
| **CURS** | En Curso Activo | Asignatura inscrita en el ciclo escolar actual sin calificación numérica final. |
| **REC · CURSO** | Recursamiento en Curso | Asignatura inscrita actualmente que registra antecedentes reprobatorios. |
| **ADEUDO** | Reprobada Activa | Último intento registrado con estatus reprobatorio (`NA`, `NP` o calificación inferior al mínimo aprobatorio del programa: 6.0 en licenciatura y 7.0 en maestría; también admite escalas de 0 a 100). |
| **OMITIDA** | Asignatura No Cursada | Materia correspondiente a cuatrimestres anteriores al actual que no registra inscripción previa. |
| **PEND.** | Pendiente Curricular | Materia programada para cuatrimestres posteriores de la trayectoria. |

---

## Vistas y Herramientas Operativas

1. **Directorio Consolidado de Grupo (Batch View)**:
   - Tabla dinámica de alta densidad con filtros por dictamen (Aprobados, Con Adeudo, No Elegibles, En Curso).
   - Buscador en tiempo real por matrícula o nombre del alumno.
   - Resumen estadístico de la generación (promedio general, porcentaje de avance, tasa de elegibilidad).
   - Exportación de la lista completa a formato CSV / Excel.
   - Generación de **Sábana Ejecutiva Oficial en PDF** lista para archivo o firma.
2. **Hoja 1: Mapa Curricular Interactivo**:
   - Visualización estructurada en cuadrícula de los 9 cuatrimestres del plan de estudios.
   - Código cromático institucional por estado de materia.
   - Selector dinámico de asignaturas electivas multidisciplinares.
   - Bloque dedicado al seguimiento de Inglés I a V y requisitos co-curriculares.
3. **Hoja 2: Cédula de Auditoría Oficial**:
   - Formato formal imprimible con balance cuantitativo de créditos y asignaturas.
   - Bitácora analítica de observaciones curriculares.
   - Recuadro institucional para firmas de Coordinación Académica y Dirección de Campus.
4. **Diseño Visual de Grado Ejecutivo**:
   - Tipografía estructurada (`Inter` y `JetBrains Mono`).
   - Soporte nativo para modo oscuro y modo claro con persistencia de preferencia de usuario.

---

## Suite de Pruebas de Integridad Automatizadas (`prebuild`)

Antes de cada proceso de compilación para producción, el sistema ejecuta de forma obligatoria el script de validación `test-health.mjs`, verificando 8 componentes críticos:

1. **Conexión a Neon PostgreSQL**: Validación de canal seguro y respuesta del servidor.
2. **Estructura de Tablas**: Existencia de las tablas `auditoria_grupal`, `auditorias_estudiantes`, `carreras`, `estatus_alumnos` y `usuarios`.
3. **Catálogo de Carreras**: Recuperación íntegra de los 13 programas de licenciatura.
4. **Motor de Auditoría**: Procesamiento analítico de expedientes prueba bajo todas las modalidades.
5. **Guardado en Base de Datos**: Inserción de lote de prueba.
6. **Consulta y Recuperación**: Validación de integridad de datos leídos.
7. **Eliminación y Limpieza**: Depuración limpia del lote de prueba sin dejar residuos.
8. **Seguridad y Acceso Dev**: Comprobación de autenticación de Super Administrador.

Si alguna de las 8 pruebas falla, la compilación de producción se detiene automáticamente para prevenir despliegues con anomalías.

---

## Arquitectura y Stack Tecnológico

- **Frontend Core**: React 19, JavaScript moderno (ESNext).
- **Herramienta de Construcción**: Vite 8.
- **Estilos**: Tailwind CSS estructurado para aplicaciones corporativas (patrones ERP).
- **Autenticación**: `@azure/msal-browser` (v3+), `@azure/msal-react`.
- **Motor PDF**: `pdfjs-dist` con Web Worker integrado localmente.
- **Generación de Reportes**: `jspdf`, `html2canvas`.
- **Base de Datos Serverless**: Neon PostgreSQL (`@neondatabase/serverless`).
- **Iconografía**: `lucide-react`.

---

## Configuración y Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como base la plantilla `.env.example` con la siguiente estructura:

```env
# Conexión a la base de datos Neon PostgreSQL Serverless
DATABASE_URL="tu_url_de_base_de_datos"
VITE_NEON_DATABASE_URL="tu_url_de_base_de_datos"

# Microsoft Entra ID (Azure AD) - UNID Single Tenant
VITE_AZURE_CLIENT_ID="tu_client_id_aqui"
VITE_AZURE_TENANT_ID="tu_tenant_id_aqui"
```

---

## Instalación y Ejecución Local

### Prerrequisitos
- Node.js versión 18.0.0 o superior.
- Administrador de paquetes `npm`.

### Procedimiento
1. Clonar el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd CORDIANCION-UNID
   ```

2. Instalar dependencias del proyecto:
   ```bash
   npm install
   ```

3. Ejecutar la suite de pruebas de salud del sistema de forma independiente:
   ```bash
   npm run test:health
   ```

4. Iniciar el servidor local de desarrollo:
   ```bash
   npm run dev
   ```

5. Generar la compilación para producción (ejecuta automáticamente las pruebas previas):
   ```bash
   npm run build
   ```

---

## Despliegue en Producción (Vercel)

El proyecto incluye la configuración en `vercel.json` para gestionar el enrutamiento y las cabeceras requeridas para aplicaciones de una sola página (SPA):

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
