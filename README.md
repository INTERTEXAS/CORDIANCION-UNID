<div align="center">
  <img src="./assets/unid-logo-full.png" alt="UNID - Universidad Interamericana para el Desarrollo" width="280" />
  <h1>Sistema de Auditoría Curricular y Validación de Estadía</h1>
  <p><strong>Universidad Interamericana para el Desarrollo &middot; Coordinación Académica</strong></p>
  <p>Plataforma institucional de grado ERP para el procesamiento de kárdex, auditoría de trayectorias académicas, persistencia en la nube y emisión automatizada de dictámenes normativos.</p>
</div>

---

## Resumen Ejecutivo

El **Sistema de Auditoría Curricular y Validación de Estadía** es una solución web institucional concebida para automatizar el análisis integral de expedientes académicos a partir de los documentos oficiales emitidos por Banner (*Detalle de selección de cursos y estado de cuenta por alumno*).

La solución opera tanto en modalidad de **expediente individual** como mediante **procesamiento masivo por generaciones (Batch Processing)**. Suprime por completo la captura manual de calificaciones y homologa los criterios de dictamen normativo para:
- Elegibilidad para Estadía Empresarial (7.º y 9.º cuatrimestres).
- Verificación de avance crediticio y asignaturas acreditadas vs. adeudadas.
- Cumplimiento de los 5 niveles obligatorios de idioma inglés o acreditación global.
- Validación de requisitos curriculares oficiales (con exclusión de cursos co-curriculares obsoletos no requeridos para titulación).
- Trazabilidad forense de recursamientos, regularizaciones y regularidad académica.

---

## Módulos y Capacidades del Sistema

### 1. Seguridad, Control de Acceso y Sesión Institucional
- **Autenticación con Microsoft Entra ID (Azure AD)**: Integración oficial mediante `@azure/msal-browser` y `@azure/msal-react` con inquilino institucional único (Single Tenant).
- **Restricción Estricta de Dominio `@unid.mx`**: La barrera de seguridad (`AuthBarrier`) inspecciona los tokens emitidos y deniega el acceso a cualquier cuenta que no pertenezca explícitamente al dominio institucional `@unid.mx`.
- **Control de Acceso Basado en Roles (RBAC) y Gestión de Usuarios**:
  - **Sincronización Transparente con Neon DB**: Cada usuario autenticado mediante Microsoft 365 es verificado dinámicamente contra la tabla `usuarios` en Neon PostgreSQL para determinar sus facultades operativas:
    - `ADMIN_SISTEMA`: Control total técnico, telemetría, gestión de hardware certificado y administración de colaboradores.
    - `COORDINADOR`: Dictamen curricular, firma oficial de cédulas y guardado de auditorías en su área académica asignada (con facultad de auditar y consultar cualquier carrera de la sede para soporte en ventanilla).
    - `CONTROL_ESCOLAR`: Supervisión global de los 14 programas, descarga masiva de sábanas ejecutivas y acceso al archivo histórico de ciclos.
    - `DIRECTOR`: Supervisión ejecutiva y validación directiva a nivel sede.
    - `CONSULTA`: Modo lectura para docentes o personal administrativo, con bloqueo estricto de eliminación o depuración de auditorías históricas.
  - **Ciclo de Vida de Personal (Altas, Bajas y Relevos)**:
    - *Baja Preventiva Inmediata:* Interruptor toggle (`Activo / Inactivo`) que revoca el acceso en milisegundos en caso de desvinculación o baja laboral, aun si la cuenta Microsoft continúa abierta.
    - *Baja Definitiva:* Opción de eliminación de registros en Neon DB (protegiendo permanentemente la cuenta de administración raíz `id = 1`).
    - *Relevo Dinámico de Coordinadoras:* Asignación desacoplada de nombres propios mediante **Divisiones Académicas** y selector con opción abierta (`+ Otra Coordinación / Área personalizada...`), permitiendo incorporar nuevas coordinaciones o sustituir titulares sin modificar el código fuente.
- **Puente OAuth de Cierre Automático**: Comunicación entre ventana emergente y ventana principal basada en `broadcastResponseToMainFrame` (`BroadcastChannel`), garantizando el cierre instantáneo de la ventana emergente tras seleccionar la cuenta sin montar la aplicación en dicha ventana.
- **Temporizador de Inactividad Institucional**: Cierre automático de sesión tras 5 minutos de inactividad del usuario para proteger expedientes en computadoras compartidas o de oficina.
- **Seguridad Avanzada de Super Admin / Desarrollador**:
  - **Huella Digital de Hardware (`deviceFingerprint`)**: Generación de identificador único de terminal combinando Canvas, WebGL, Audio y UserAgent mediante `@fingerprintjs/fingerprintjs`.
  - **Autorización Previa de Equipos**: Solo terminales expresamente registradas y activas en la tabla `dispositivos_autorizados` pueden iniciar sesión técnica.
  - **Geolocalización Forense de Alta Precisión**: Registro de coordenadas GPS reales con geocodificación inversa (Nominatim / OpenStreetMap), dirección legible por humanos, enlace directo a Google Maps e IP de conexión.
  - **Panel de Control de Seguridad (`SecurityAdminPanel`)**: Interfaz dedicada para Super Administradores con bitácora de accesos en tiempo real (`auditoria_accesos_dev`) con `LEFT JOIN` a equipos, revocación/activación remota de terminales, directorio institucional de usuarios y roles RBAC en vivo, y monitoreo de telemetría.

### 2. Motor de Extracción y Análisis de Kárdex (PDF.js)
- **Extracción de Coordenadas Espaciales**: Lectura directa de operadores de texto en PDF mediante coordenadas analíticas, sin depender de OCR susceptible a fallos.
- **Detección Automática de Modalidad**: Identificación algorítmica de la modalidad del estudiante (Escolarizada, No Escolarizada / Ejecutiva o Maestría) a partir del contenido del documento.
- **Segmentación Estricta de Campos Banner**:
  - Asignatura, clave de materia (`SUBJ` / `CRSE`), código CRN, periodo cursado, calificación numérica y modalidad de acreditación.
  - Exclusión automática de ruido institucional (calificaciones parciales sin valor final, leyendas administrativas).
- **Detección de Desfase de Programas**: Modal interactivo que alerta al usuario si el kárdex cargado pertenece a un programa académico distinto al seleccionado en la vista, permitiendo la reconfiguración inmediata del entorno con un solo clic.

### 3. Persistencia en la Nube (Neon Serverless PostgreSQL)
- **Base de Datos Serverless en la Nube**: Almacenamiento estructurado mediante Neon PostgreSQL y conexión optimizada por pooler (`@neondatabase/serverless`).
- **Gestión por Ciclos Escolares**: Organización y persistencia de lotes completos de alumnos clasificados por ciclo escolar y cuatrimestre.
- **Gestor de Auditorías y Ciclos (`NeonAuditManagerModal`)**: Interfaz con estilo *Academic Ledger* corporativo que permite guardar el grupo activo, consultar expedientes históricos, cargarlos a la vista en 1 clic y depurar registros antiguos.
- **Política de Retención Inteligente (5 Meses)**: Utilidad de mantenimiento colapsable que calcula la antigüedad de los registros conforme al ciclo escolar UNID (4 meses lectivos + 1 mes de trámites/inscripciones) para depurar auditorías obsoletas en un solo paso.
- **Contingencia Local**: Si la conexión remota no estuviera disponible, el sistema mantiene la operación local en memoria sin interrumpir el trabajo de coordinación.

### 4. Asistente Académico Inteligente (Gemini Flash & Neon DB)
El sistema integra un asistente conversacional de coordinación (`AcademicAssistant`) diseñado bajo arquitectura híbrida y principios de alta usabilidad corporativa:
- **Arquitectura Híbrida de Privacidad**:
  - Las consultas de matrículas, alumnos, carreras y ciclos escolares se resuelven en microsegundos directamente sobre la base de datos Neon mediante sentencias SQL optimizadas, **sin exponer datos personales de alumnos a proveedores externos de IA** ni consumir cuota innecesaria.
  - El modelo **Google Gemini Flash Lite** se invoca de manera selectiva y segura exclusivamente para responder dudas conceptuales, procesos de la plataforma y orientación de normativas institucionales.
- **Carga Interactiva en Pantalla Completa (Action Execution)**:
  - **Apertura de Auditoría de Grupo (`LOAD_BATCH_AUDIT`)**: Al solicitar peticiones como *"abre el kardex completo de MAE-MADP-22"*, *"abre el grupo de [Carrera]"* o *"ver sábana de [Carrera]"*, el asistente detecta la clave del programa, carga todos los expedientes del ciclo desde Neon DB y conmuta la pantalla principal directamente a la vista de **Auditoría de Grupo** (`BatchAuditView`).
  - **Apertura de Kárdex Individual (`LOAD_STUDENT_AUDIT`)**: Al indicar *"abre el kardex de [Matrícula]"* o *"abre el expediente de [Nombre]"*, la interfaz carga la auditoría en el **Mapa Curricular** y en la **Cédula Oficial**.
- **Diseño Anti-Saturación**:
  - **Tarjeta Ejecutiva de Grupo**: Sustituye la acumulación masiva de botones en el chat por un componente compacto compuesto por un botón primario de carga general y un selector desplegable (`<select>`) para consultar alumnos individuales sin consumir espacio vertical.
  - **Fichas Resumen Ejecutivas**: Formato sintético de 6 a 8 líneas (menos de 350 caracteres) con métricas clave (aprobadas, adeudos, omitidas, pendientes y dictamen) condensadas en una sola línea.
- **Memoria de Contexto Continuo**: Reconoce automáticamente referencias a alumnos previos en el historial de la conversación cuando el usuario selecciona opciones directas como *"Resumen general"*, *"Adeudos y materias pendientes"*, *"Materias aprobadas"* o *"Carrera y ciclo escolar"*.
- **Directiva Estricta de Cero Emojis**: Todo el asistente (prompts del modelo, respuestas generadas, botones y componentes visuales) opera bajo un estándar sobrio institucional, prescindiendo por completo de emojis y empleando viñetas y tipografía corporativa.

### 5. Catálogo Oficial de Programas Académicos (18 Programas)
El sistema integra y sincroniza 18 programas institucionales (14 Licenciaturas y 4 Maestrías PAC) organizados por coordinación académica mediante distintivos de color semánticos en el menú desplegable:

**Coordinación: Laura Angélica Ara Angulo (Ciencias Económico-Administrativas) · Color Púrpura**
1. **LIC-COFI-18**: Licenciatura en Contabilidad y Finanzas (Mixto) - Federal (37 materias)
2. **LIC-DAEM-18**: Licenciatura en Administración y Dirección Empresarial - Plan 2018 Dual (46 materias)
3. **LIC-EJCO-17**: Licenciatura en Contabilidad Financiera - Plan 202160 Ejecutivo Modular (44 materias)

**Coordinación: Yessica Inurreta Pavón (Arquitectura, Derecho, Educación y Deporte) · Color Naranja**
4. **LIC-ARQU-18**: Licenciatura en Arquitectura (Mixto) - Federal (37 materias)
5. **LIC-DERE-18**: Licenciatura en Derecho y Ciencias Jurídicas (Mixto) - Federal (37 materias)
6. **LIC-EJDE-17**: Licenciatura Ejecutiva en Derecho (Modular) - Federal (44 materias)
7. **LIC-EJED-17**: Licenciatura Ejecutiva en Educación y Tecnologías para el Aprendizaje (Modular) - Federal (44 materias)
8. **LIC-EDFI-18**: Licenciatura en Educación Física, Recreación y Deporte (Mixto) - Federal (37 materias)

**Coordinación: Avelina García Romeo (Diseño, Administración, Mercadotecnia e Ingeniería) · Color Rosa**
9. **LIC-DSGD-18**: Licenciatura en Diseño Gráfico Digital (Mixto) - Federal (37 materias)
10. **LIC-EJAD-17**: Licenciatura en Administración de Empresas (Mixto) - Federal (49 materias)
11. **LIC-MEES-18**: Licenciatura en Mercadotecnia Estratégica (Mixto) - Federal (37 materias)
12. **LIC-SYSC-18**: Licenciatura en Ingeniería de Software y Sistemas Computacionales (Mixto) - Federal (37 materias)
13. **LIC-ADME-18**: Licenciatura en Administración Empresarial (Mixto) - Federal (37 materias)
14. **LIC-CTCO-18**: Licenciatura en Ciencias y Técnicas de la Comunicación (Mixto) - Federal (37 materias)

**Coordinación de Posgrados y Maestrías (PAC) · Color Verde Esmeralda**
15. **MAE-EDUP-22**: Maestría en Educación (PAC) - Plan 2022 (15 materias)
16. **MAE-MADP-22**: Maestría en Administración de Negocios (PAC) - Plan 2022 (15 materias)
17. **MAE-MDEC-20**: Maestría en Derecho Constitucional y Amparo (Mixta) - Plan 2020 (15 materias)
18. **MAE-MERP-22**: Maestría en Mercadotecnia y Medios Digitales (PAC) - Plan 2022 (15 materias)

---

## Experiencia de Usuario y Diseño Visual (Estándar Enterprise Universitario)

El sistema incorpora un diseño de alta densidad de información (*Swiss High-Density & Dark Obsidian Enterprise*) concebido para reducir la sobrecarga cognitiva de los coordinadores académicos:

### 1. Directorio Consolidado de Grupo (Batch Audit View)
- **Cinta de KPIs Ejecutivos**: Métricas de primer nivel (Total de Expedientes, Tasa de Aprobación/Elegibilidad, Promedio de Generación y Casos de Atención Prioritaria).
- **Filtros Segmentados Dinámicos**: Píldoras con conteo numérico real que ocultan automáticamente categorías en cero para evitar ruido en pantalla.
- **Buscador en Tiempo Real**: Filtrado instantáneo por nombre o matrícula.
- **Generación de Sábana Ejecutiva Oficial en PDF**: Exportación lista para firma de actas o archivo institucional.

### 2. Modo Plan Oficial Base y Pestañas Dinámicas
- **Explorador Curricular Inmediato**: Al ingresar o cambiar de carrera en la barra superior (sin kárdex cargado), el sistema despliega de inmediato la Malla Curricular Oficial completa de la carrera con sus cuatrimestres, claves, créditos y distintivos Conecta.
- **Pestañas Adaptables por Contexto**:
  - *Modo Consulta:* Pestañas `Malla Curricular Oficial` y `Auditar Alumno (Subir Kárdex)`.
  - *Modo Auditoría:* Conmuta automáticamente a `Hoja 1: Mapa de Ejecución` y `Hoja 2: Cédula de Auditoría` una vez cargado el expediente.
  - *Acción Rápida:* Botón `[ ⬆ Auditar Kárdex ]` en la cintilla superior del mapa para cargar el kárdex sobre ese plan con 1 clic.

### 3. Hoja 1: Mapa Curricular Interactivo (Curriculum Map)
- **Principio de Diseño por Excepción**: Las asignaturas acreditadas en ordinario presentan un aspecto limpio y armónico sin saturar con insignias innecesarias.
- **Tipografía Académica en Title Case**: Los nombres de las materias se formatean automáticamente de mayúsculas sostenidas a mayúsculas/minúsculas legibles.
- **Codificación Visual Semántica**:
  - Borde izquierdo esmeralda para asignaturas acreditadas (`ORD`).
  - Borde punteado en gris frío para materias pendientes (`PEND`).
  - Acentos ámbar para recursamientos acreditados (`REC`).
  - Alerta roja destacada para materias en adeudo activo (`ADEUDO`).
- **Requisito de Inglés Curricular (1.º al 5.º)**: Fila transversal dedicada que audita los 5 niveles obligatorios de idioma inglés o la exención formal (`LENG-0008`).
- **Barra de Nomenclatura y Catálogo de Electivas Bajo Demanda**: Se mantiene colapsada durante la consulta cotidiana para maximizar el área de trabajo y se auto-expande automáticamente al imprimir o exportar a PDF.

### 4. Hoja 2: Cédula Oficial de Auditoría y Trazabilidad (Audit Cédula)
- **Resumen Cuantitativo de 3 KPIs Dominantes**: Avance de Plan (aprobadas/total), Inglés Curricular y Promedio General ponderado.
- **Resumen Técnico en 1 Línea**: Desglose consolidado de 1.ª oportunidad, recursadas, adeudos y materias en curso.
- **Dictamen Normativo Institucional**: Redacción ejecutiva certificada en 2 renglones concisos con estatus explícito (`AUTORIZADO` / `RETENIDO`).
- **Bitácora Forense de Incidencias**: Trazabilidad detallada de materias que requirieron múltiples intentos o regularización, indicando periodos y calificaciones.

### 5. Botón Flotante (FAB) de Asistente Académico Inteligente
- **Acceso Siempre Visible**: Botón flotante dorado en la esquina inferior derecha (`Asistente UNID`) que abre el chatbot institucional en una ventana emergente limpia y responsive.
- **Búsquedas Híbridas Seguras**: Consultas directas a Neon PostgreSQL para proteger la privacidad de los estudiantes.

### 6. Micro-Cockpit de Telemetría Escolar en Sidebar
- **Micro-tarjeta Interactiva**: Ubicada en el pie de la barra lateral con pulso en vivo (`animate-ping`) verde esmeralda para el pooler de Neon PostgreSQL.
- **Acceso Directo con 1 Clic**: Al presionar la tarjeta, se abre de inmediato el gestor de base de datos sin necesidad de navegar a través de otras pantallas.
- **Firma de Compilación Institucional**: Muestra el campus activo (`Sede CAM`) y la versión de compilación (`v2026.1 · MIXTO`) en tipografía técnica monospaciada.

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
| **ADEUDO** | Reprobada Activa | Último intento registrado con estatus reprobatorio (`NA`, `NP` o calificación inferior al mínimo aprobatorio del programa: 6.0 en licenciatura y 7.0 en maestría). |
| **OMITIDA** | Asignatura No Cursada | Materia sin inscripción cuyo cuatrimestre curricular ya fue alcanzado en la trayectoria del alumno. |
| **PEND.** | Pendiente Curricular | Materia de cuatrimestres futuros respecto al avance del estudiante. |

---

## Suite de Pruebas de Integridad Automatizadas (`prebuild` y CI)

Antes de cada compilación para producción (`npm run build`), el sistema ejecuta de manera estricta y obligatoria una batería de **más de 353 pruebas automatizadas** distribuidas en suites de verificación continua:

```bash
npm run test
# Ejecuta: test-health.mjs, test-comprehensive.mjs, test-dev-security.mjs y test-academic-assistant.mjs
```

1. **`test-health.mjs` (8 Pruebas de Salud)**:
   - Conexión a Neon PostgreSQL mediante pooler seguro.
   - Verificación de esquema y tablas requeridas (`auditoria_grupal`, `auditorias_estudiantes`, `carreras`, `usuarios`, `dispositivos_autorizados`, `auditoria_accesos_dev`).
   - Sincronización del catálogo de los 14 programas.
   - Procesamiento del motor de auditoría con expedientes sintéticos.
   - Ciclo completo de inserción, consulta y depuración de lotes de prueba.
   - Verificación de credenciales de Super Administrador.

2. **`test-comprehensive.mjs` (135+ Pruebas de Negocio y Auditoría)**:
   - Autenticación, normalización y rechazo de dominios ajenos a `@unid.mx`.
   - Detección algorítmica de modalidades (Escolarizado, Ejecutivo, Maestría).
   - Tolerancia a anomalías de kárdex: dobles espacios, tildes omitidas, claves divididas y códigos no homologados.
   - Cálculo de promedios, créditos y dictámenes de estadía conforme al reglamento UNID.
   - Verificación de los 5 niveles de inglés y requisitos co-curriculares.

3. **`test-dev-security.mjs` (65 Pruebas de Seguridad y Forense)**:
   - Extracción y hashing de huella digital de hardware (`device_id`).
   - Bloqueo de accesos desde equipos no autorizados y registro de intentos fallidos.
   - Verificación de `LEFT JOIN` entre bitácora de accesos y terminales autorizadas.
   - Activación, desactivación y revocación remota de dispositivos.
   - Geolocalización de alta precisión (GPS, reverse geocoding con Nominatim, enlaces a Google Maps y fallback por IP).

4. **`test-academic-assistant.mjs` (5 Pruebas de Integración de API)**:
   - Validación de barreras de autenticación y tokens Dev/Super Admin.
   - Respuestas guiadas por matrícula y encadenamiento contextual de preguntas académicas.
   - Filtro de carreras y aislamiento de datos personales respecto a Gemini.

5. **`test-assistant-140-benchmark.mjs` (140 Pruebas Exhaustivas de Usabilidad y Calidad)**:
   - Verificación de 15 tipos de peticiones de apertura de grupo (`LOAD_BATCH_AUDIT`).
   - Verificación de 15 tipos de peticiones de apertura individual (`LOAD_STUDENT_AUDIT`).
   - Seguimiento conversacional sin falsos bloqueos.
   - Validación estricta de no-saturación de texto (<650 caracteres) y eliminación de listas masivas de botones.
   - Auditoría estricta de Cero Emojis (0 violaciones permitidas).

> [!IMPORTANT]
> Si una sola prueba de las suites obligatorias falla, la compilación de producción se detiene de inmediato, imposibilitando el despliegue de versiones con fallos.

---

## Arquitectura y Stack Tecnológico

- **Frontend Core**: React 19, JavaScript moderno (ESNext).
- **Herramienta de Construcción**: Vite 8.
- **Estilos**: Tailwind CSS estructurado para aplicaciones corporativas (patrones ERP y diseño de alta densidad).
- **Autenticación**: `@azure/msal-browser` (v5+), `@azure/msal-react`.
- **Seguridad de Hardware**: `@fingerprintjs/fingerprintjs`.
- **Motor PDF**: `pdfjs-dist` con Web Worker integrado localmente.
- **Generación de Reportes**: `jspdf`, `html2canvas`.
- **Base de Datos Serverless**: Neon PostgreSQL (`@neondatabase/serverless`).
- **Servicios de Inteligencia**: Google Gemini Flash Lite (endpoint server-side en Node.js).
- **Iconografía**: `lucide-react`.

---

## Configuración y Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como base la plantilla `.env.example`:

```env
# Neon PostgreSQL para endpoints server-side (Guardar como secreto en Vercel)
DATABASE_URL="postgresql://usuario:password@ep-ejemplo.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Gemini exclusivo en servidor (Sin prefijo VITE_)
GEMINI_API_KEY="tu_clave_de_google_ai_studio"
GEMINI_MODEL="gemini-3.5-flash-lite"

# Firma de sesión para acceso técnico de Super Administrador
ACADEMIC_ASSISTANT_ADMIN_SECRET="tu_clave_secreta_minimo_32_caracteres"

# Variable usada temporalmente por módulos del frontend (VITE_ la hace pública)
VITE_NEON_DATABASE_URL="postgresql://usuario:password@ep-ejemplo.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Microsoft Entra ID (Azure AD) - UNID Single Tenant
VITE_AZURE_CLIENT_ID="tu_client_id_aqui"
VITE_AZURE_TENANT_ID="tu_tenant_id_aqui"

# Lista blanca opcional de IPs para acceso técnico de desarrollo
ALLOWED_DEV_IPS=""
VITE_ALLOWED_DEV_IPS=""
```

### Notas de Seguridad sobre Variables de Entorno:
- `DATABASE_URL`, `GEMINI_API_KEY` y `ACADEMIC_ASSISTANT_ADMIN_SECRET` son **exclusivas del servidor** y deben configurarse como secretos en el panel de Vercel. Nunca deben exponerse con el prefijo `VITE_`.
- `VITE_NEON_DATABASE_URL` sigue utilizándose temporalmente por componentes cliente que requieren interactuar de forma reactiva con Neon en el navegador (`NeonAuditManagerModal`).
- Las cuentas con rol `ADMIN_SISTEMA`, `super_admin` o `superadmin` reciben una sesión firmada criptográficamente con vigencia de 1 hora al autenticarse en el módulo técnico.

---

## Instalación y Comandos de Ejecución

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

3. Ejecutar las suites de pruebas de forma individual o conjunta:
   ```bash
   # Suite obligatoria completa
   npm run test

   # Suites individuales
   npm run test:health
   npm run test:comprehensive
   npm run test:security
   npm run test:assistant

   # Benchmark exhaustivo del asistente (140 casos)
   node test-assistant-140-benchmark.mjs
   ```

4. Iniciar el servidor local de desarrollo:
   ```bash
   npm run dev
   ```

5. Generar la compilación para producción (ejecuta automáticamente las pruebas previas en `prebuild`):
   ```bash
   npm run build
   ```

---

## Despliegue en Producción (Vercel)

El proyecto incluye la configuración en `vercel.json` para gestionar el enrutamiento y las cabeceras requeridas para aplicaciones de una sola página (SPA) y funciones serverless:

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
