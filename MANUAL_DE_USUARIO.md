# Manual Oficial de Usuario
## Sistema de Auditoría Curricular y Validación de Estadía
### Universidad Interamericana para el Desarrollo (UNID) · Sede Campeche

---

<div align="center">
  <img src="./assets/unid-logo-full.png" alt="UNID - Universidad Interamericana para el Desarrollo" width="280" />
  <p><strong>Coordinaciones de Licenciaturas Mixtas, Ejecutivas y Posgrados</strong></p>
  <p><em>Versión v2026.1 Enterprise · RVOE Federal Vigente · Noviembre de 2026</em></p>
</div>

---

## Índice General

1. [Introducción y Propósito del Sistema](#1-introducción-y-propósito-del-sistema)
2. [Políticas de Seguridad y Control de Acceso](#2-políticas-de-seguridad-y-control-de-acceso)
3. [Flujo Operativo Paso a Paso (Guía Rápida)](#3-flujo-operativo-paso-a-paso-guía-rápida)
4. [Módulos y Pantallas de la Plataforma](#4-módulos-y-pantallas-de-la-plataforma)
   - 4.1 [Modo Plan Oficial Base (Consulta Curricular sin Alumno)](#41-modo-plan-oficial-base-consulta-curricular-sin-alumno)
   - 4.2 [Pestañas Dinámicas (Modo Consulta vs. Modo Auditoría)](#42-pestañas-dinámicas-modo-consulta-vs-modo-auditoría)
   - 4.3 [Hoja 1: Mapa Curricular Interactivo y Validación](#43-hoja-1-mapa-curricular-interactivo-y-validación)
   - 4.4 [Hoja 2: Cédula Oficial de Auditoría y Trazabilidad](#44-hoja-2-cédula-oficial-de-auditoría-y-trazabilidad)
   - 4.5 [Eliminación de Requisitos Obsoletos de Egreso y Titulación](#45-eliminación-de-requisitos-obsoletos-de-egreso-y-titulación)
   - 4.6 [Directorio Consolidado de Grupo (Auditoría Masiva - Batch View)](#46-directorio-consolidado-de-grupo-auditoría-masiva---batch-view)
   - 4.7 [Asistente Académico Inteligente (Botón Flotante FAB)](#47-asistente-académico-inteligente-botón-flotante-fab)
   - 4.8 [Gestor de Base de Datos y Persistencia en Neon PostgreSQL](#48-gestor-de-base-de-datos-y-persistencia-en-neon-postgresql)
   - 4.9 [Micro-Cockpit de Telemetría en Barra Lateral](#49-micro-cockpit-de-telemetría-en-barra-lateral)
   - 4.10 [Módulo de Gestión de Usuarios y Roles (RBAC)](#410-módulo-de-gestión-de-usuarios-y-roles-rbac)
5. [Matriz de Estados Curriculares y Reglas de Negocio](#5-matriz-de-estados-curriculares-y-reglas-de-negocio)
6. [Emisión y Descarga de Documentos Oficiales en PDF](#6-emisión-y-descarga-de-documentos-oficiales-en-pdf)
7. [Catálogo Oficial de los 18 Programas Académicos](#7-catálogo-oficial-de-los-18-programas-académicos)
8. [Solución de Problemas Frecuentes y Soporte Técnico](#8-solución-de-problemas-frecuentes-y-soporte-técnico)
9. [Limitantes de Hospedaje y Recomendaciones Operativas](#9-limitantes-de-hospedaje-y-recomendaciones-operativas)

---

## 1. Introducción y Propósito del Sistema

El **Sistema de Auditoría Curricular y Validación de Estadía** es la plataforma web institucional desarrollada para la Universidad Interamericana para el Desarrollo (UNID), diseñada con el objetivo de automatizar de punta a punta el análisis y dictaminación de expedientes académicos a partir de los kárdex oficiales emitidos por el ERP Banner (*Detalle de selección de cursos y estado de cuenta por alumno*).

### Objetivo Central
Garantizar que ningún estudiante avance a Estadía Empresarial (7.º o 9.º cuatrimestre) o proceso de titulación si registra asignaturas adeudadas o materias omitidas de 1.º a 6.º cuatrimestre, otorgando certeza jurídica a las Coordinaciones y a la Dirección de Sede.

### Capacidades Principales
- **Visor Curricular Oficial Base:** Permite consultar la malla de estudios completa de las 18 carreras con cuatrimestres, claves, créditos y distintivos Conecta sin necesidad de cargar un alumno.
- **Extracción Espacial Banner (PDF.js):** Lectura analítica de texto basada en coordenadas espaciales, sin OCR, con 100% de precisión.
- **Auditoría Individual y Masiva (Batch):** Procesamiento individual por alumno o grupal de carpetas completas con decenas de expedientes.
- **Detección Automática de Modalidad:** Identificación autónoma de modalidades Escolarizada, Mixta, Ejecutiva Modular o Posgrado / Maestría.
- **Requisitos de Titulación Actualizados:** Foco exclusivo en los 5 niveles de inglés curricular o exención formal; exclusión de cursos no curriculares obsoletos.
- **Asistente Académico con IA:** Asistente conversacional institucional accesible vía botón flotante (FAB), con consultas directas a base de datos y total privacidad de datos personales.

---

## 2. Políticas de Seguridad y Control de Acceso

1. **Autenticación con Microsoft Entra ID (Azure AD):** Conexión institucional exclusiva mediante cuenta corporativa `@unid.mx`.
2. **Restricción Estricta de Dominio:** Bloqueo absoluto a cualquier cuenta ajena a `@unid.mx`.
3. **Control de Acceso Basado en Roles (RBAC):**
   - `ADMIN_SISTEMA`: Control total técnico, telemetría, gestión de hardware y usuarios.
   - `COORDINADOR`: Dictamen curricular, firma de cédulas y guardado de lotes.
   - `CONTROL_ESCOLAR`: Supervisión global de los 18 programas y descarga de sábanas.
   - `DIRECTOR`: Validación ejecutiva y supervisión a nivel sede.
   - `CONSULTA`: Modo lectura para docentes o administrativos, sin permisos de depuración.
4. **Temporizador de Inactividad (5 Minutos):** Cierre automático de sesión tras 5 minutos sin actividad física (movimiento de mouse o teclado) para proteger expedientes en computadoras compartidas.
5. **Consola de Seguridad Forense (`/admin/seguridad`):**
   - Huella digital de hardware (`deviceFingerprint`).
   - Lista blanca de dispositivos autorizados en Neon PostgreSQL.
   - Geolocalización de alta precisión (GPS, Nominatim, Google Maps e IP de conexión).

---

## 3. Flujo Operativo Paso a Paso (Guía Rápida)

1. **Paso 1: Inicio de Sesión**  
   Acceda a la aplicación e inicie sesión con su cuenta institucional `@unid.mx`.
2. **Paso 2: Selección de Carrera o Consulta de Plan**  
   En la cabecera superior, seleccione la carrera en el menú desplegable (organizado por coordinaciones). La malla curricular oficial completa aparecerá de inmediato en pantalla.
3. **Paso 3: Carga de Kárdex Oficial (PDF)**  
   Haga clic en `Auditar Kárdex` o `Subir Kárdex` y seleccione el PDF emitido por Banner. El sistema cambiará a modo auditoría con calificaciones y dictamen.
4. **Paso 4: Verificación en Hoja 1 (Mapa Curricular)**  
   Revise la cuadrícula: verde (ordinarias), ámbar (recursadas), azul (regularizaciones), rojo (adeudos activos) y gris (pendientes).
5. **Paso 5: Emisión de Hoja 2 (Cédula Oficial)**  
   Cambie a la pestaña `Hoja 2: Cédula de Auditoría` para corroborar el dictamen normativo y descargar el documento PDF certificado de 2 hojas para firmas.
6. **Paso 6: Guardado en la Nube (Neon DB)**  
   En la barra lateral o en la vista grupal, presione `Guardar en Base de Datos`, indique el ciclo escolar (ej. `2026-1`) y guarde el lote.

---

## 4. Módulos y Pantallas de la Plataforma

### 4.1 Modo Plan Oficial Base (Consulta Curricular sin Alumno)
Al ingresar a la plataforma o cambiar de programa en el selector de carreras sin haber subido un kárdex, el sistema activa automáticamente el **Modo Plan Oficial Base**.
- Despliega todos los cuatrimestres (9 en licenciaturas, 5 en maestrías o 10 en DAEM Dual).
- Muestra los nombres oficiales, claves Banner, créditos curriculares e insignias Conecta (materias virtuales institucionales).
- Incluye la cintilla institucional de metadatos y el botón de acción rápida `[ ⬆ Auditar Kárdex ]`.
- Al hacer clic en cualquier asignatura, se abre una ventana modal con el detalle de la materia, clave y modalidad.

### 4.2 Pestañas Dinámicas (Modo Consulta vs. Modo Auditoría)
El conmutador superior adapta sus etiquetas y funciones según el estado de la sesión:
- **En Modo Consulta (Sin Alumno):**
  - Pestaña 1: `Malla Curricular Oficial` (con icono de libro).
  - Pestaña 2: `Auditar Alumno (Subir Kárdex)` (con icono de subida y tarjeta interactiva).
- **En Modo Auditoría (Con Alumno Cargado):**
  - Pestaña 1: `Hoja 1: Mapa de Ejecución`.
  - Pestaña 2: `Hoja 2: Cédula de Auditoría`.
  - Habilita la barra de filtros por oportunidad (Ordinarias, Recursadas, Modo RE, Adeudos).

### 4.3 Hoja 1: Mapa Curricular Interactivo y Validación
Proyecta la trayectoria real del alumno sobre el plan oficial de la carrera:
- **Diseño por Excepción:** Las materias aprobadas ordinarias se presentan sobrias y limpias con borde verde esmeralda. Las anomalías o adeudos captan de inmediato la atención del auditor.
- **Requisito de Inglés Curricular (1.º al 5.º):** Fila transversal inferior ubicada bajo los primeros 5 cuatrimestres, con seguimiento de los niveles `LENG-F001` a `F005` o exención formal (`LENG-0008`).

### 4.4 Hoja 2: Cédula Oficial de Auditoría y Trazabilidad
Documento oficial de dictamen académico, configurado con dimensiones exactas para firma institucional:
- **Resumen Cuantitativo en 3 KPIs Principales:** Avance de Plan (materias aprobadas / total), Inglés Curricular (niveles acreditados / 5) y Promedio General Ponderado.
- **Dictamen Normativo Institucional:** Caja destacada que certifica en texto legal si el expediente se encuentra `100% APROBADO / ELEGIBLE PARA ESTADÍA Y TITULACIÓN` o `RETENIDO POR ADEUDO ACADÉMICO`.
- **Bitácora Forense de Incidencias:** Tabla que desglosa materias recursadas, exámenes extraordinarios (Modo RE) y periodos cursados.

### 4.5 Eliminación de Requisitos Obsoletos de Egreso y Titulación
En concordancia con los lineamientos vigentes de Coordinación y Control Escolar de UNID, se retiraron los cursos co-curriculares no obligatorios (Ortografía `MPD-CMS02`, Comprensión Lectora `MPD-CMS03` y Curso de Preparación EGEL I `CUPR-EG`). Dichos cursos ya no forman parte de los requisitos de titulación institucional, garantizando que ningún alumno sea retenido indebidamente por su ausencia.

### 4.6 Directorio Consolidado de Grupo (Auditoría Masiva - Batch View)
Permite procesar carpetas completas de kárdex:
- Cinta de KPIs ejecutivos de la generación.
- Buscador en vivo por matrícula o apellidos.
- Píldoras de filtrado por estatus.
- Exportación de la Sábana Ejecutiva Oficial en PDF y Excel (CSV).

### 4.7 Asistente Académico Inteligente (Botón Flotante FAB)
Ubicado en la esquina inferior derecha mediante un botón flotante estilizado con la leyenda `Asistente UNID`:
- **Consultas Seguras y Privadas:** Las búsquedas de alumnos, carreras y ciclos se resuelven en microsegundos directamente sobre Neon PostgreSQL, sin enviar datos confidenciales de alumnos a proveedores externos de IA.
- **Apertura en Pantalla Completa:** Permite solicitar peticiones como *"abre el kardex de 00312175"* o *"abre el grupo de Contabilidad"* para conmutar la pantalla principal de forma automática.
- **Estándar Sobrio Sin Emojis:** Respuestas corporativas y directas conforme al estándar de sobriedad universitaria.

### 4.8 Gestor de Base de Datos y Persistencia en Neon PostgreSQL
- Almacenamiento estructurado por ciclos escolares (ej. `2026-1`) y cuatrimestre.
- Carga de expedientes históricos en 1 clic.
- Política de retención y depuración inteligente a los 5 meses (4 meses lectivos + 1 mes de trámites).

### 4.9 Micro-Cockpit de Telemetría en Barra Lateral
Monitorea la conexión en la nube mediante un punto pulsante verde (`Serverless Pooler Online`), dando acceso directo con 1 clic al Gestor de Base de Datos.

### 4.10 Módulo de Gestión de Usuarios y Roles (RBAC)
Ubicado en `/admin/seguridad` para gestionar altas, bajas preventivas (toggle `Activo/Inactivo`) y relevos de coordinadoras sin modificar código fuente.

---

## 5. Matriz de Estados Curriculares y Reglas de Negocio

| Código | Denominación Oficial | Identificador Visual | Criterio de Dictamen |
| :--- | :--- | :--- | :--- |
| **ORD** | 1.ª Oportunidad Ordinaria | Borde Verde Esmeralda | Asignatura aprobada en su primera inscripción formal. |
| **REC** | Recursamiento Acreditado | Ámbar Institucional | Asignatura aprobada tras registrar uno o más periodos previos reprobados. |
| **RE** | Regularización / Extraordinario | Azul Institucional | Materia acreditada mediante examen extraordinario o proceso de regularización. |
| **CURS** | En Curso Activo | Borde Azul Cielo | Asignatura inscrita en el periodo escolar activo sin calificación numérica definitiva. |
| **REC · CURSO** | Recursamiento en Curso | Púrpura | Asignatura inscrita actualmente que registra antecedentes previos reprobatorios. |
| **ADEUDO** | Reprobada Activa (Adeudo) | Rojo Carmesí | Último intento registrado con estatus reprobatorio (< 6.0 en licenciatura o < 7.0 en maestría; NA o NP). Bloquea Estadía y Titulación. |
| **OMITIDA** | Asignatura No Cursada | Naranja Oscuro | Materia sin inscripción cuyo cuatrimestre curricular ya fue alcanzado por el avance del alumno. Bloquea Estadía. |
| **PEND.** | Pendiente Curricular | Gris Punteado | Materia perteneciente a cuatrimestres futuros respecto a la trayectoria del estudiante. |

---

## 6. Emisión y Descarga de Documentos Oficiales en PDF

1. **Cédula Oficial de Auditoría (Formato de 2 Hojas):**
   - **Hoja 1:** Mapa curricular de ejecución con calificaciones, promedios y catálogo de electivas.
   - **Hoja 2:** Cédula de auditoría, trazabilidad forense de intentos y recuadros de firma institucional.
2. **Sábana Ejecutiva Grupal (Batch Report):**
   - Documento horizontal para comités de titulación y actas de Control Escolar, con ordenación alfabética y porcentajes de avance de toda la generación.

---

## 7. Catálogo Oficial de los 18 Programas Académicos

Los 18 programas se encuentran integrados en el selector superior con su respectiva identificación cromática y coordinación responsable:

### Coordinación: Laura Angélica Ara Angulo (Ciencias Económico-Administrativas) · Color Púrpura
1. **LIC-COFI-18:** Licenciatura en Contabilidad y Finanzas (Mixto) - Plan 2018 (37 materias)
2. **LIC-DAEM-18:** Licenciatura en Administración y Dirección Empresarial - Plan Dual 2018 (46 materias)
3. **LIC-EJCO-17:** Licenciatura Ejecutiva en Contabilidad Financiera - Plan Modular (44 materias)

### Coordinación: Yessica Inurreta Pavón (Arquitectura, Derecho, Educación y Deporte) · Color Naranja
4. **LIC-ARQU-18:** Licenciatura en Arquitectura (Mixto) - Plan 2018 (37 materias)
5. **LIC-DERE-18:** Licenciatura en Derecho y Ciencias Jurídicas (Mixto) - Plan 2018 (37 materias)
6. **LIC-EJDE-17:** Licenciatura Ejecutiva en Derecho - Plan Modular (44 materias)
7. **LIC-EJED-17:** Licenciatura Ejecutiva en Educación y Tecnologías del Aprendizaje - Plan Modular (44 materias)
8. **LIC-EDFI-18:** Licenciatura en Educación Física, Recreación y Deporte (Mixto) - Plan 2018 (37 materias)

### Coordinación: Avelina García Romeo (Diseño, Administración, Mercadotecnia e Ingeniería) · Color Rosa
9. **LIC-DSGD-18:** Licenciatura en Diseño Gráfico Digital (Mixto) - Plan 2018 (37 materias)
10. **LIC-EJAD-17:** Licenciatura Ejecutiva en Administración de Empresas - Plan Modular (49 materias)
11. **LIC-MEES-18:** Licenciatura en Mercadotecnia Estratégica (Mixto) - Plan 2018 (37 materias)
12. **LIC-SYSC-18:** Licenciatura en Ingeniería de Software y Sistemas Computacionales (Mixto) - Plan 2018 (37 materias)
13. **LIC-ADME-18:** Licenciatura en Administración Empresarial (Mixto) - Plan 2018 (37 materias)
14. **LIC-CTCO-18:** Licenciatura en Ciencias y Técnicas de la Comunicación (Mixto) - Plan 2018 (37 materias)

### Coordinación de Posgrados y Maestrías (PAC) · Color Verde Esmeralda
15. **MAE-EDUP-22:** Maestría en Educación (PAC) - Plan 2022 (15 materias)
16. **MAE-MADP-22:** Maestría en Administración de Negocios (PAC) - Plan 2022 (15 materias)
17. **MAE-MDEC-20:** Maestría en Derecho Constitucional y Amparo (Mixta) - Plan 2020 (15 materias)
18. **MAE-MERP-22:** Maestría en Mercadotecnia y Medios Digitales (PAC) - Plan 2022 (15 materias)

---

## 8. Solución de Problemas Frecuentes y Soporte Técnico

- **¿Por qué al abrir el sistema veo materias si aún no he subido un kárdex?**  
  Corresponde al *Modo Plan Oficial Base*. Le permite consultar la malla oficial de cualquier carrera con cuatrimestres y créditos. Al subir un kárdex, el mapa se actualizará con las notas del alumno.
- **¿Por qué no aparecen los requisitos de Ortografía y EGEL?**  
  En cumplimiento de la normativa actual de UNID, dichos cursos fueron retirados de los requisitos de titulación. La validación transversal de egreso se concentra exclusivamente en los 5 niveles de inglés curricular.
- **¿Qué hacer ante un aviso de "Desfase de Programa Académico"?**  
  El kárdex cargado pertenece a una carrera distinta a la seleccionada. El modal interactivo le permite cambiar el entorno a la carrera correcta con 1 clic.
- **¿Qué sucede si se interrumpe la conexión a Internet o a Neon DB?**  
  El sistema conmuta de inmediato a *Modo de Contingencia Local*. Toda la auditoría, mapas y exportación a PDF continúan funcionando al 100% en el navegador.

---

## 9. Limitantes de Hospedaje y Recomendaciones Operativas

- **Cold Start de Neon (1.5 a 3.5 segundos):** Si la base de datos lleva más de 5 minutos inactiva, la primera consulta del día experimentará una breve espera mientras se reactiva la instancia serverless.
- **Almacenamiento Estructurado (500 MB):** Solo se almacenan dictámenes en formato JSON comprimido, nunca archivos PDF pesados. Mantenga la base optimizada con la política de retención de 5 meses.
- **Procesamiento en Memoria RAM Local:** Para evitar lentitud en computadoras de oficina con 4 GB de RAM, se recomienda procesar kárdex en bloques de 25 a 50 alumnos por lote.
- **Limpieza de Caché tras Actualizaciones:** Si no visualiza algún cambio reciente, presione `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac).

---

<div align="center">
  <sub>Universidad Interamericana para el Desarrollo &middot; Sede Campeche &middot; Sistema de Auditoría Curricular v2026.1 Enterprise</sub>
</div>
