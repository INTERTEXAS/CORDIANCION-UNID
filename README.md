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
- Requisitos co-curriculares, talleres de titulación y examen EGEL.
- Trazabilidad forense de recursamientos, regularizaciones y regularidad académica.

---

## Módulos y Capacidades del Sistema

### 1. Seguridad, Control de Acceso y Sesión Institucional
- **Autenticación con Microsoft Entra ID (Azure AD)**: Integración oficial mediante `@azure/msal-browser` y `@azure/msal-react` con inquilino institucional único (Single Tenant).
- **Restricción Estricta de Dominio `@unid.mx`**: La barrera de seguridad (`AuthBarrier`) inspecciona los tokens emitidos y deniega el acceso a cualquier cuenta que no pertenezca explícitamente al dominio institucional `@unid.mx`.
- **Puente OAuth de Cierre Automático**: Comunicación entre ventana emergente y ventana principal basada en `broadcastResponseToMainFrame` (`BroadcastChannel`), garantizando el cierre instantáneo de la ventana emergente tras seleccionar la cuenta sin montar la aplicación en dicha ventana.
- **Temporizador de Inactividad Institucional**: Cierre automático de sesión tras 5 minutos de inactividad del usuario para proteger expedientes en computadoras compartidas o de oficina.
- **Seguridad Avanzada de Super Admin / Desarrollador**:
  - **Huella Digital de Hardware (`deviceFingerprint`)**: Generación de identificador único de terminal combinando Canvas, WebGL, Audio y UserAgent mediante `@fingerprintjs/fingerprintjs`.
  - **Autorización Previa de Equipos**: Solo terminales expresamente registradas y activas en la tabla `dispositivos_autorizados` pueden iniciar sesión técnica.
  - **Geolocalización Forense de Alta Precisión**: Registro de coordenadas GPS reales con geocodificación inversa (Nominatim / OpenStreetMap), dirección legible por humanos, enlace directo a Google Maps e IP de conexión.
  - **Panel de Control de Seguridad (`SecurityAdminPanel`)**: Interfaz dedicada para Super Administradores con bitácora de accesos en tiempo real (`auditoria_accesos_dev`) con `LEFT JOIN` a equipos, revocación/activación remota de terminales y eliminación de accesos no autorizados.

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

## Experiencia de Usuario y Diseño Visual (Estándar Enterprise Universitario)

El sistema incorpora un diseño de alta densidad de información (*Swiss High-Density & Dark Obsidian Enterprise*) concebido para reducir la sobrecarga cognitiva de los coordinadores académicos:

### 1. Directorio Consolidado de Grupo (Batch Audit View)
- **Cinta de KPIs Ejecutivos**: Métricas de primer nivel (Total de Expedientes, Tasa de Aprobación/Elegibilidad, Promedio de Generación y Casos de Atención Prioritaria).
- **Filtros Segmentados Dinámicos**: Píldoras con conteo numérico real que ocultan automáticamente categorías en cero para evitar ruido en pantalla.
- **Buscador en Tiempo Real**: Filtrado instantáneo por nombre o matrícula.
- **Generación de Sábana Ejecutiva Oficial en PDF**: Exportación lista para firma de actas o archivo institucional.

### 2. Hoja 1: Mapa Curricular Interactivo (Curriculum Map)
- **Principio de Diseño por Excepción**: Las asignaturas acreditadas en ordinario presentan un aspecto limpio y armónico sin saturar con insignias innecesarias.
- **Tipografía Académica en Title Case**: Los nombres de las materias se formatean automáticamente de mayúsculas sostenidas a mayúsculas/minúsculas legibles.
- **Codificación Visual Semántica**:
  - Borde izquierdo esmeralda para asignaturas acreditadas (`ORD`).
  - Borde punteado en gris frío para materias pendientes (`PEND`).
  - Acentos ámbar para recursamientos acreditados (`REC`).
  - Alerta roja destacada para materias en adeudo activo (`ADEUDO`).
- **Barra de Nomenclatura y Catálogo de Electivas Bajo Demanda**: Se mantiene colapsada durante la consulta cotidiana para maximizar el área de trabajo y se auto-expande automáticamente al imprimir o exportar a PDF.

### 3. Hoja 2: Cédula Oficial de Auditoría y Trazabilidad (Audit Cédula)
- **Resumen Cuantitativo de 4 KPIs Dominantes**: Avance de Plan, Inglés, Requisitos Co-curriculares y Promedio General ponderado.
- **Resumen Técnico en 1 Línea**: Desglose consolidado de 1.ª oportunidad, recursadas, adeudos y materias en curso.
- **Dictamen Normativo Institucional**: Redacción ejecutiva certificada en 2 renglones concisos con estatus explícito (`AUTORIZADO` / `RETENIDO`).
- **Bitácora Forense de Incidencias**: Trazabilidad detallada de materias que requirieron múltiples intentos o regularización, indicando periodos y calificaciones.

### 4. Micro-Cockpit de Telemetría Escolar en Sidebar
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

## Suite de Pruebas de Integridad Automatizadas (`prebuild`)

Antes de cada compilación para producción (`npm run build`), el sistema ejecuta de manera estricta y obligatoria una batería de **más de 208 pruebas automatizadas** dividida en 3 suites:

```bash
npm run test
# Ejecuta: node test-health.mjs && node test-comprehensive.mjs && node test-dev-security.mjs
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

> [!IMPORTANT]
> Si una sola prueba de las 208 falla, la compilación de producción se detiene de inmediato, imposibilitando el despliegue de versiones con fallos.

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
- **Iconografía**: `lucide-react`.

---

## Configuración y Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como base la plantilla `.env.example`:

```env
# Conexión a la base de datos Neon PostgreSQL Serverless (Pooler)
DATABASE_URL="postgresql://usuario:password@ep-ejemplo.us-east-2.aws.neon.tech/neondb?sslmode=require"
VITE_NEON_DATABASE_URL="postgresql://usuario:password@ep-ejemplo.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Microsoft Entra ID (Azure AD) - UNID Single Tenant
VITE_AZURE_CLIENT_ID="tu_client_id_aqui"
VITE_AZURE_TENANT_ID="tu_tenant_id_aqui"
```

---

`DATABASE_URL` y `GEMINI_API_KEY` son variables exclusivas del servidor y deben configurarse como secretos en Vercel. No usar el prefijo `VITE_` para credenciales nuevas. `VITE_NEON_DATABASE_URL` sigue utilizándose temporalmente por funcionalidades actuales del navegador; quitarla requiere migrar esas consultas a endpoints server-side para no interrumpirlas.

El endpoint del asistente valida el acceso con Microsoft Graph y restringe las consultas a cuentas `@unid.mx`. Para una matrícula busca únicamente dentro de la carrera seleccionada y envía a Gemini un resumen académico con campos permitidos, sin nombre ni matrícula. Antes de usar datos reales, la institución debe autorizar su procesamiento mediante el proveedor externo.

### Acceso del asistente para administradores

Configura `ACADEMIC_ASSISTANT_ADMIN_SECRET` como variable privada de servidor en Vercel y en el `.env` local. Debe ser un valor aleatorio de al menos 32 caracteres; no lo expongas con el prefijo `VITE_`. Las cuentas con rol `ADMIN_SISTEMA`, `super_admin` o `superadmin` reciben, tras verificar sus credenciales en Neon, una sesión firmada que expira en una hora. Si esta configuración del asistente falta, el acceso a `/internal-dev-access` sigue disponible y muestra un aviso, pero el asistente académico queda deshabilitado hasta configurarla. Los errores de autorización distintos a esa falta de configuración siguen bloqueando el acceso.

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
   # Suite completa (208+ pruebas)
   npm run test

   # Suites individuales
   npm run test:health
   npm run test:comprehensive
   npm run test:security
   ```

4. Iniciar el servidor local de desarrollo:
   ```bash
   npm run dev
   ```

5. Generar la compilación para producción (ejecuta automáticamente las 208+ pruebas previas):
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