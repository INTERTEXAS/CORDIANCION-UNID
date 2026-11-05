#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del Manual de Usuario Oficial en formato Microsoft Word (.docx / .doc)
para el Sistema de Auditoría Curricular y Validación de Estadía de UNID.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Aplica color de fondo a una celda de tabla."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Establece márgenes internos de una celda en dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_callout_box(doc, title, text, box_type="info"):
    """Agrega una caja de aviso destacada con borde lateral de color."""
    colors = {
        "info": {"bg": "F8FAFC", "border": "0284C7", "title_color": RGBColor(2, 132, 199)},
        "warning": {"bg": "FFFBEB", "border": "D97706", "title_color": RGBColor(217, 119, 6)},
        "danger": {"bg": "FEF2F2", "border": "DC2626", "title_color": RGBColor(220, 38, 38)},
        "success": {"bg": "F0FDF4", "border": "16A34A", "title_color": RGBColor(22, 163, 74)},
        "gold": {"bg": "FFFDF0", "border": "F2B705", "title_color": RGBColor(194, 120, 3)}
    }
    cfg = colors.get(box_type, colors["info"])
    
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, cfg["bg"])
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    cell.width = Inches(6.5)
    
    # Borde izquierdo grueso, los demás transparentes/nulos
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="32" w:space="0" w:color="{cfg["border"]}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"📌 {title.upper()}\n")
    run_t.bold = True
    run_t.font.name = "Calibri"
    run_t.font.size = Pt(10)
    run_t.font.color.rgb = cfg["title_color"]
    
    run_body = p.add_run(text)
    run_body.font.name = "Calibri"
    run_body.font.size = Pt(9.5)
    run_body.font.color.rgb = RGBColor(51, 65, 85)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def build_manual():
    doc = docx.Document()
    
    # Configuración de márgenes de página estándar (2.5 cm)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
    
    # =========================================================================
    # PORTADA INSTITUCIONAL
    # =========================================================================
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(40)
    p_logo.paragraph_format.space_after = Pt(20)
    
    logo_path = os.path.abspath("assets/unid-logo-full.png")
    if os.path.exists(logo_path):
        p_logo.add_run().add_picture(logo_path, width=Inches(3.2))
    
    p_suborg = doc.add_paragraph()
    p_suborg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_suborg.paragraph_format.space_after = Pt(6)
    r_suborg = p_suborg.add_run("COORDINACIÓN ACADÉMICA · SEDE CAMPECHE")
    r_suborg.font.name = "Calibri"
    r_suborg.font.size = Pt(11)
    r_suborg.bold = True
    r_suborg.font.color.rgb = RGBColor(217, 119, 6) # Amber
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("MANUAL OFICIAL DE USUARIO\nSISTEMA DE AUDITORÍA CURRICULAR Y VALIDACIÓN DE ESTADÍA")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
    
    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_before = Pt(8)
    p_desc.paragraph_format.space_after = Pt(40)
    r_desc = p_desc.add_run(
        "Guía Integral de Operación, Criterios Normativos de Dictamen,\n"
        "Procesamiento Masivo de Kárdex y Gestión de Base de Datos en Neon PostgreSQL"
    )
    r_desc.font.name = "Calibri"
    r_desc.font.size = Pt(11)
    r_desc.font.color.rgb = RGBColor(71, 85, 105)
    
    # Tabla de Metadatos de la Portada
    meta_tbl = doc.add_table(rows=5, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Institución:", "Universidad Interamericana para el Desarrollo (UNID)"),
        ("Sede / Campus:", "Sede Campeche (CAM) · Zona Sureste"),
        ("Área Responsable:", "Coordinación de Licenciaturas Mixtas, Ejecutivas y Posgrados"),
        ("Versión del Sistema:", "v2026.1 Enterprise · RVOE Federal 2018"),
        ("Fecha de Publicación:", "Noviembre de 2026")
    ]
    for idx, (label, val) in enumerate(meta_data):
        row = meta_tbl.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        set_cell_background(cell_lbl, "F1F5F9")
        set_cell_background(cell_val, "F8FAFC")
        set_cell_margins(cell_lbl, top=80, bottom=80, left=120, right=120)
        set_cell_margins(cell_val, top=80, bottom=80, left=120, right=120)
        cell_lbl.width = Inches(2.2)
        cell_val.width = Inches(4.3)
        
        p0 = cell_lbl.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(label)
        r0.bold = True
        r0.font.name = "Calibri"
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(30, 41, 59)
        
        p1 = cell_val.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(51, 65, 85)
        
    doc.add_page_break()
    
    # Configurar Encabezado y Pie de Página para las páginas subsiguientes
    body_section = doc.sections[0] # Note: Word applies to section
    # Create section 2 for body if needed, or configure headers
    header = body_section.header
    p_head = header.paragraphs[0]
    p_head.text = "UNID · Manual Oficial de Usuario · Sistema de Auditoría Curricular"
    p_head.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_head.runs[0].font.name = "Calibri"
    p_head.runs[0].font.size = Pt(8.5)
    p_head.runs[0].font.color.rgb = RGBColor(148, 163, 184)
    
    footer = body_section.footer
    p_foot = footer.paragraphs[0]
    p_foot.text = "Universidad Interamericana para el Desarrollo · Coordinación Académica Sede CAM"
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.runs[0].font.name = "Calibri"
    p_foot.runs[0].font.size = Pt(8.5)
    p_foot.runs[0].font.color.rgb = RGBColor(148, 163, 184)

    def add_heading_1(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(22)
        h.paragraph_format.space_after = Pt(8)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(16)
        r.bold = True
        r.font.color.rgb = RGBColor(15, 23, 42)
        # Línea divisoria decorativa bajo el título
        p_line = doc.add_paragraph()
        p_line.paragraph_format.space_before = Pt(0)
        p_line.paragraph_format.space_after = Pt(12)
        r_line = p_line.add_run("—" * 55)
        r_line.font.name = "Calibri"
        r_line.font.size = Pt(9)
        r_line.font.color.rgb = RGBColor(217, 119, 6)
        return h

    def add_heading_2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(12.5)
        r.bold = True
        r.font.color.rgb = RGBColor(30, 41, 59)
        return h

    def add_body(text, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r_pre = p.add_run(bold_prefix + ": ")
        r_pre.bold = True
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(9.5)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
        
        r_txt = p.add_run(text)
        r_txt.font.name = "Calibri"
        r_txt.font.size = Pt(9.5)
        r_txt.font.color.rgb = RGBColor(51, 65, 85)
        return p

    # =========================================================================
    # ÍNDICE GENERAL DEL MANUAL
    # =========================================================================
    add_heading_1("CONTENIDO DEL MANUAL DE USUARIO")
    
    toc_items = [
        ("1. Introducción y Propósito del Sistema", "3"),
        ("2. Políticas de Seguridad y Control de Acceso", "4"),
        ("3. Flujo Operativo Paso a Paso (Guía Rápida)", "6"),
        ("4. Módulos y Pantallas de la Plataforma", "8"),
        ("   4.1 Pantalla de Inicio y Conexión Institucional", "8"),
        ("   4.2 Directorio Consolidado de Grupo (Auditoría Masiva)", "9"),
        ("   4.3 Hoja 1: Mapa Curricular Interactivo Oficial", "11"),
        ("   4.4 Hoja 2: Cédula Oficial de Auditoría y Trazabilidad", "13"),
        ("   4.5 Gestor de Ciclos y Persistencia en Neon PostgreSQL", "15"),
        ("   4.6 Micro-Cockpit de Telemetría en la Barra Lateral", "16"),
        ("   4.7 Módulo de Gestión de Usuarios y Control de Roles (RBAC)", "17"),
        ("5. Matriz de Estados Curriculares y Reglas de Negocio", "18"),
        ("6. Emisión y Descarga de Documentos Oficiales en PDF", "20"),
        ("7. Catálogo de los 14 Programas Institucionales Soportados", "21"),
        ("8. Solución de Problemas Frecuentes y Soporte Técnico", "22"),
        ("9. Limitantes de Hospedaje y Recomendaciones Operativas", "23")
    ]
    
    toc_tbl = doc.add_table(rows=len(toc_items), cols=2)
    toc_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (cap, pag) in enumerate(toc_items):
        r = toc_tbl.rows[idx]
        c0, c1 = r.cells[0], r.cells[1]
        c0.width = Inches(5.8)
        c1.width = Inches(0.7)
        set_cell_margins(c0, top=40, bottom=40, left=60, right=60)
        set_cell_margins(c1, top=40, bottom=40, left=60, right=60)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        run0 = p0.add_run(cap)
        run0.font.name = "Calibri"
        run0.font.size = Pt(10)
        if not cap.startswith("   "):
            run0.bold = True
            run0.font.color.rgb = RGBColor(15, 23, 42)
        else:
            run0.font.color.rgb = RGBColor(71, 85, 105)
            
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        run1 = p1.add_run(pag)
        run1.font.name = "Calibri"
        run1.font.size = Pt(9.5)
        run1.bold = True
        run1.font.color.rgb = RGBColor(217, 119, 6)
        
    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 1: INTRODUCCIÓN Y PROPÓSITO
    # =========================================================================
    add_heading_1("1. INTRODUCCIÓN Y PROPÓSITO DEL SISTEMA")
    
    add_body(
        "El Sistema de Auditoría Curricular y Validación de Estadía es la plataforma web "
        "institucional desarrollada para la Universidad Interamericana para el Desarrollo (UNID), "
        "diseñada con el propósito de automatizar de punta a punta la dictaminación de expedientes "
        "académicos, suprimir por completo la captura manual de calificaciones y homologar los "
        "criterios normativos de acreditación en la Sede Campeche y el sistema federal UNID."
    )
    
    add_body(
        "Tradicionalmente, la validación de kárdex para determinar la elegibilidad de un alumno para "
        "ingresar a la Estadía Empresarial (en 7.º o 9.º cuatrimestre) requería confrontar manualmente "
        "decenas de materias contra el plan de estudios, verificar recursamientos y corroborar niveles "
        "de idioma inglés en documentos extensos generados por el ERP Banner. Este sistema procesa "
        "dichos documentos oficiales en segundos, detecta el plan aplicable, calcula créditos y genera "
        "la Cédula Oficial con validez institucional."
    )
    
    add_callout_box(
        doc,
        "Objetivo Central de la Plataforma",
        "Garantizar que ningún estudiante avance a Estadía Empresarial o proceso de titulación si registra "
        "asignaturas no acreditadas (adeudos activos o materias omitidas de 1.º a 6.º cuatrimestre), "
        "proporcionando certeza jurídica y académica a la Coordinación y a la Dirección de Campus.",
        box_type="gold"
    )
    
    add_heading_2("1.1 Capacidades Principales de la Solución")
    add_bullet("Extracción Espacial Banner (PDF.js)", "Lee directamente los documentos oficiales emitidos por el sistema Banner ('Detalle de selección de cursos y estado de cuenta por alumno') sin utilizar OCR, garantizando 100% de precisión en calificaciones y claves.")
    add_bullet("Auditoría Individual y Masiva (Batch)", "Permite auditar el expediente de un solo alumno o procesar simultáneamente carpetas con decenas de kárdex de un grupo completo.")
    add_bullet("Detección Automática de Modalidad", "Reconoce de manera autónoma si el estudiante cursa Modalidad Escolarizada, Mixta, Ejecutiva o Maestría.")
    add_bullet("Trazabilidad Forense de Intentos", "Registra el historial completo de recursamientos (REC), regularizaciones extraordinarias (RE) y materias en curso activo.")
    add_bullet("Persistencia en Servidor Serverless (Neon)", "Almacena los lotes completos por ciclo escolar y cuatrimestre para consulta histórica y auditorías posteriores.")
    add_bullet("Emisión Oficial Imprimible", "Produce la Cédula de Auditoría en 2 hojas y la Sábana Ejecutiva Grupal con formato certificado para firma y archivo escolar.")

    # =========================================================================
    # CAPÍTULO 2: SEGURIDAD Y CONTROL DE ACCESO
    # =========================================================================
    add_heading_1("2. POLÍTICAS DE SEGURIDAD Y CONTROL DE ACCESO")
    
    add_body(
        "Por tratarse de una plataforma que gestiona expedientes académicos confidenciales y "
        "dictámenes que impactan el egreso de los alumnos, el sistema cuenta con rigurosas capas "
        "de seguridad de estándar corporativo:"
    )
    
    add_heading_2("2.1 Autenticación Institucional Microsoft Entra ID (Azure AD)")
    add_body(
        "El acceso a la plataforma es estrictamente exclusivo para colaboradores y coordinadores "
        "de UNID con cuenta activa bajo el dominio oficial @unid.mx. El inicio de sesión se realiza "
        "a través del protocolo seguro de Microsoft 365 / Microsoft Entra ID."
    )
    
    add_callout_box(
        doc,
        "Restricción Estricta de Dominio Institucional",
        "La barrera de seguridad del sistema (AuthBarrier) analiza el token criptográfico emitido por Microsoft. "
        "Si un usuario intenta iniciar sesión con una cuenta personal (@gmail.com, @hotmail.com, etc.) "
        "o un dominio no perteneciente a UNID, el acceso será revocado automáticamente en pantalla "
        "con una alerta explícita y se destruirá la sesión.",
        box_type="danger"
    )

    add_heading_2("2.2 Temporizador de Inactividad (Políticas de Oficina y Computadoras Compartidas)")
    add_body(
        "Para salvaguardar la privacidad de las calificaciones en computadoras de oficina o recintos "
        "compartidos, el sistema incorpora un temporizador institucional de inactividad:"
    )
    add_bullet("Tiempo de Inactividad", "5 minutos continuos sin movimiento del ratón, pulsación de teclas o clics.")
    add_bullet("Acción Automática", "Cierre inmediato de sesión, borrado de datos temporales en memoria y redirección a la pantalla de acceso con un aviso explicativo de 20 segundos.")

    add_heading_2("2.3 Acceso Especial de Super Administrador / Desarrollador")
    add_body(
        "Existe un portal técnico reservado exclusivamente para mantenimiento de base de datos, "
        "inspección de tablas y auditoría forense (`/admin/seguridad`), protegido por:"
    )
    add_bullet("Huella Digital de Hardware (Device Fingerprint)", "Identificador criptográfico de 64 caracteres generado por Canvas, WebGL y Audio del equipo.")
    add_bullet("Lista Blanca de Terminales", "Solo las computadoras previamente registradas en la tabla 'dispositivos_autorizados' pueden acceder a dicho entorno.")
    add_bullet("Geolocalización GPS y Auditoría de Acceso", "Cada visita y login registra coordenadas GPS, enlace a Google Maps, dirección física (Nominatim) e IP pública.")

    # =========================================================================
    # CAPÍTULO 3: FLUJO OPERATIVO PASO A PASO
    # =========================================================================
    add_heading_1("3. FLUJO OPERATIVO PASO A PASO (GUÍA RÁPIDA)")
    
    add_body(
        "A continuación se describe el procedimiento estándar para auditar un grupo o un alumno "
        "desde el inicio de la jornada académica:"
    )
    
    pasos = [
        ("Paso 1: Inicio de Sesión", "Abra el sistema en el navegador web (ej. Google Chrome, Edge o Safari). En la pantalla de bienvenida, presione el botón 'Iniciar sesión con Microsoft 365' e ingrese sus credenciales institucionales (@unid.mx)."),
        ("Paso 2: Selección de Carrera o Programa", "En la barra superior, seleccione del menú desplegable el programa académico correspondiente (por ejemplo: LIC-COFI-18 Contabilidad y Finanzas, LIC-DERE-18 Derecho, etc.)."),
        ("Paso 3: Carga de Expedientes (PDF)", "Haga clic en el botón 'Cargar Kárdex en PDF' o 'Cargar Lote de Grupo'. Puede seleccionar uno o múltiples archivos PDF emitidos por Banner. El motor analizará los documentos en cuestión de segundos."),
        ("Paso 4: Verificación del Directorio Grupal", "Si cargó un lote grupal, la vista le mostrará la tabla consolidada con el porcentaje de avance de cada alumno, el total de asignaturas acreditadas, el promedio y el dictamen automático."),
        ("Paso 5: Inspección Individual del Mapa Curricular", "Haga clic sobre cualquier alumno de la lista para abrir su 'Mapa Curricular Interactivo'. Revise la cuadrícula de cuatrimestres: las materias verdes están acreditadas; las rojas indican adeudo activo."),
        ("Paso 6: Emisión de la Cédula Oficial", "Cambie a la pestaña 'Cédula de Auditoría' para revisar la dictaminación legal e imprimir el formato oficial de dos hojas listo para firmas."),
        ("Paso 7: Resguardo en la Base de Datos (Neon)", "En la barra lateral o en la vista grupal, presione 'Guardar en Base de Datos'. Indique el ciclo escolar (ej. 2026-1) y el cuatrimestre para almacenar el grupo en la nube de forma permanente.")
    ]
    
    for titulo, desc in pasos:
        add_bullet(titulo, desc)
        
    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 4: MÓDULOS Y PANTALLAS DE LA PLATAFORMA
    # =========================================================================
    add_heading_1("4. MÓDULOS Y PANTALLAS DE LA PLATAFORMA")
    
    add_heading_2("4.1 Pantalla de Inicio y Conexión Institucional")
    add_body(
        "Es el punto de entrada a la plataforma. Diseñada bajo la estética Obsidian Enterprise, "
        "presenta el identificador de la Sede CAM, el indicador de seguridad en vivo 'Acceso Seguro "
        "Microsoft Entra ID' y el botón de autenticación con el logotipo oficial de Microsoft 365."
    )

    add_heading_2("4.2 Directorio Consolidado de Grupo (Auditoría Masiva - Batch View)")
    add_body(
        "Es la herramienta de mayor impacto para las coordinaciones al inicio y cierre de cada ciclo. "
        "Presenta una tabla de alta densidad informativa (*Swiss High-Density*) donde se listan todos "
        "los estudiantes cargados en la sesión:"
    )
    add_bullet("Cinta Superior de KPIs", "Muestra 4 tarjetas de resumen ejecutivo: Total de Alumnos Auditados, Tasa de Elegibilidad a Estadía (% de aprobados), Promedio Ponderado de la Generación y Casos de Atención Prioritaria (alumnos con adeudos).")
    add_bullet("Buscador en Tiempo Real", "Permite localizar inmediatamente a cualquier alumno escribiendo su matrícula (ej. 00445566) o sus apellidos.")
    add_bullet("Segmentación por Filtros", "Píldoras dinámicas que permiten ver únicamente a los alumnos con Dictamen Aprobado, alumnos con Adeudo, materias Omitidas o en Curso.")
    add_bullet("Generación de Sábana Ejecutiva", "Un botón permite exportar la lista a Excel (CSV) o descargar un PDF formal con la relación completa del grupo, encabezado institucional UNID y cuadros de control escolar.")

    add_heading_2("4.3 Hoja 1: Mapa Curricular Interactivo Oficial")
    add_body(
        "Al seleccionar un estudiante, esta vista proyecta el plan de estudios oficial organizado en "
        "columnas que representan los cuatrimestres lectivos (del 1.º al 9.º cuatrimestre):"
    )
    add_bullet("Diseño por Excepción", "Las materias acreditadas en ordinario presentan un aspecto limpio con borde verde esmeralda y el estatus 'Acreditada', permitiendo que los ojos del auditor detecten al instante las anomalías o adeudos.")
    add_bullet("Tipografía Académica (Title Case)", "Los nombres de las materias se formatean automáticamente de mayúsculas continuas a títulos legibles (ej. 'Contabilidad Financiera Internacional').")
    add_bullet("Requisito de Inglés (LENG-F001 a F005)", "Bloque inferior dedicado que audita los 5 niveles obligatorios de idioma inglés o la exención global mediante el código institucional LENG-0008.")
    add_bullet("Catálogo de Electivas Multidisciplinares", "Barra inferior colapsable que lista las asignaturas optativas registradas por el estudiante y las homologa al mapa curricular.")

    add_heading_2("4.4 Hoja 2: Cédula Oficial de Auditoría y Trazabilidad")
    add_body(
        "Documento oficial de dictamen académico, configurado con dimensiones exactas de impresión "
        "para integrarse a la carpeta física del estudiante ante Control Escolar y la Dirección de Campus:"
    )
    add_bullet("Resumen Cuantitativo en 4 Bloques", "Total de Materias Aprobadas / Plan (ej. 37/37), Estatus de Inglés (ej. 5/5), Requisitos Co-curriculares y Promedio General.")
    add_bullet("Dictamen Normativo Institucional", "Caja destacada que certifica en texto legal si el expediente se encuentra '100% APROBADO / ELEGIBLE PARA ESTADÍA Y TITULACIÓN' o 'RETENIDO POR ADEUDO ACADÉMICO'.")
    add_bullet("Bitácora de Trazabilidad e Incidencias", "Tabla forense que desglosa cada intento previo del alumno: periodo en que cursó, código CRN, calificación obtenida y motivo de dictamen.")
    add_bullet("Cuadros de Firma y Sello", "Espacios reglamentarios para firma autógrafa de Coordinación de Licenciaturas y Dirección de Sede CAM.")

    add_heading_2("4.5 Gestor de Ciclos y Persistencia en Neon PostgreSQL")
    add_body(
        "Modal institucional accesible desde la barra lateral que gestiona la base de datos en la nube:"
    )
    add_bullet("Guardado por Lote", "Almacena los expedientes procesados asignándoles una etiqueta de ciclo (ej. '2026-1') y el cuatrimestre correspondiente.")
    add_bullet("Consulta y Carga Instantánea", "Permite recuperar auditorías guardadas hace meses con un solo clic en 'Cargar en Pantalla', sin necesidad de volver a solicitar los PDFs a los alumnos.")
    add_bullet("Política de Depuración Automática a los 5 Meses", "Utilidad de mantenimiento que calcula la antigüedad de los registros. El ciclo escolar de UNID dura 4 meses de clases más 1 mes de inscripciones y aclaraciones; con un clic, se pueden depurar registros antiguos para mantener la base de datos optimizada.")

    add_heading_2("4.6 Micro-Cockpit de Telemetría en la Barra Lateral")
    add_body(
        "Ubicado en el pie de la barra lateral izquierda, proporciona información operativa en tiempo real:"
    )
    add_bullet("Micro-tarjeta Interactiva", "Muestra un punto pulsante verde cuando la conexión con Neon PostgreSQL está activa (Serverless Pooler Online).")
    add_bullet("Acceso Directo con 1 Clic", "Hacer clic sobre la tarjeta abre inmediatamente el Gestor de Base de Datos sin tener que navegar por otros menús.")
    add_bullet("Metadatos Técnicos", "Indica el campus activo ('Sede CAM') y la versión de compilación en tipografía técnica monospaciada (`v2026.1 · MIXTO`).")

    add_heading_2("4.7 Módulo de Gestión de Usuarios y Control de Roles (RBAC)")
    add_body(
        "Accesible desde la Consola de Seguridad (/admin/seguridad), este módulo permite administrar la "
        "identidad institucional, los roles normativos y el ciclo de vida del personal académico (altas, bajas y relevos)."
    )
    add_body(
        "El sistema opera bajo una arquitectura RBAC (Role-Based Access Control) que vincula las credenciales "
        "de Microsoft 365 Entra ID (@unid.mx) con las facultades de autorización registradas en Neon PostgreSQL:"
    )
    add_bullet("ADMIN_SISTEMA (Administrador Total)", "Acceso irrestricto a la consola de seguridad, telemetría de red, autorización de computadoras físicas por huella criptográfica y gestión de colaboradores.")
    add_bullet("COORDINADOR (Coordinador Académico)", "Facultad de realizar auditorías curriculares, emitir cédulas oficiales de estadía y titulación con su firma institucional, y persistir ciclos en su área asignada. Para garantizar la atención en ventanilla ante ausencias, cualquier coordinadora puede auditar y consultar cualquiera de las 14 carreras de la sede.")
    add_bullet("CONTROL_ESCOLAR (Control Escolar de Sede)", "Supervisión integral de los 14 programas institucionales, generación masiva de sábanas ejecutivas en PDF y consulta del archivo histórico de ciclos.")
    add_bullet("DIRECTOR (Dirección de Sede)", "Visión ejecutiva global y validación institucional de los dictámenes emitidos.")
    add_bullet("CONSULTA / DOCENTE (Sólo Lectura)", "Permite explorar los mapas curriculares y kárdex, pero bloquea las funciones destructivas (no puede eliminar auditorías históricas ni depurar ciclos).")

    add_heading_2("4.7.1 Procedimientos de Alta, Baja y Relevo de Personal")
    add_body(
        "Para garantizar la continuidad operativa de la sede ante despidos, renuncias o nuevas contrataciones, "
        "la plataforma provee tres mecanismos de autogestión sin necesidad de soporte de ingeniería de software:"
    )
    add_bullet("Alta de Nuevo Colaborador", "Hacer clic en '+ Colaborador', ingresar nombre completo, correo institucional @unid.mx, seleccionar el rol y elegir su División Académica correspondiente. Se guardará de inmediato en Neon DB.")
    add_bullet("Baja Inmediata (Revocación Preventiva)", "Ante un despido o desvinculación laboral, basta con hacer clic en el switch toggle de la fila del colaborador para cambiar su estado a 'Inactivo (Acceso Revocado)'. El sistema bloqueará su ingreso en milisegundos, aun si la persona mantiene abierta su sesión de Microsoft 365.")
    add_bullet("Baja Definitiva", "El botón de papelera permite eliminar el registro del colaborador de la base de datos (con protección permanente para evitar borrar al administrador raíz id=1).")
    add_bullet("Relevo Dinámico de Coordinadoras", "Las opciones de coordinación están desacopladas de nombres propios y organizadas por División Académica. Además, incluye la opción '+ Otra Coordinación / Área personalizada...' para ingresar cualquier nueva división, licenciatura o departamento que cree la institución sin alterar el código fuente.")
    add_bullet("Sustitución Directa", "Hacer clic en el botón de lápiz (Editar) para actualizar el nombre y correo de la persona saliente por la nueva titular, transfiriendo la titularidad del área en un solo paso.")

    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 5: MATRIZ DE ESTADOS CURRICULARES
    # =========================================================================
    add_heading_1("5. MATRIZ DE ESTADOS CURRICULARES Y REGLAS DE NEGOCIO")
    
    add_body(
        "Cada asignatura identificada en el kárdex se evalúa bajo una estricta jerarquía de reglas "
        "institucionales, clasificándose bajo los siguientes estados normativos:"
    )
    
    matriz_data = [
        ("ORD", "1.ª Oportunidad Ordinaria", "Verde Esmeralda", "Asignatura aprobada en su primera inscripción formal."),
        ("REC", "Recursamiento Acreditado", "Ámbar / Naranja", "Asignatura aprobada tras registrar uno o más periodos previos reprobados."),
        ("RE", "Regularización / Extraordinario", "Azul Institucional", "Materia acreditada mediante examen extraordinario o proceso de regularización."),
        ("CURS", "En Curso Activo", "Magenta / Rosa", "Asignatura inscrita en el periodo escolar activo sin calificación numérica definitiva."),
        ("REC·CURSO", "Recursamiento en Curso", "Púrpura", "Asignatura inscrita actualmente que registra antecedentes previos reprobatorios."),
        ("ADEUDO", "Reprobada Activa (Adeudo)", "Rojo Carmesí", "Último intento registrado con estatus reprobatorio (calificación menor a 6.0 en licenciatura o menor a 7.0 en maestría; NA o NP). Bloquea Estadía."),
        ("OMITIDA", "Asignatura No Cursada", "Naranja Oscuro", "Materia sin inscripción cuyo cuatrimestre curricular ya fue alcanzado por el avance del alumno. Bloquea Estadía."),
        ("PEND.", "Pendiente Curricular", "Gris Frío Punteado", "Materia perteneciente a cuatrimestres futuros respecto a la trayectoria del estudiante.")
    ]
    
    m_tbl = doc.add_table(rows=len(matriz_data) + 1, cols=4)
    m_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Código", "Denominación Oficial", "Identificador Visual", "Criterio de Dictamen"]
    for i, h_text in enumerate(headers):
        c = m_tbl.rows[0].cells[i]
        set_cell_background(c, "0F172A") # Slate 900
        set_cell_margins(c, top=100, bottom=100, left=100, right=100)
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    for idx, (cod, den, col, crit) in enumerate(matriz_data):
        row = m_tbl.rows[idx + 1]
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([cod, den, col, crit]):
            c = row.cells[i]
            set_cell_background(c, bg)
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9)
            if i == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(15, 23, 42)
            else:
                r.font.color.rgb = RGBColor(51, 65, 85)
                
    m_tbl.columns[0].width = Inches(1.1)
    m_tbl.columns[1].width = Inches(1.8)
    m_tbl.columns[2].width = Inches(1.4)
    m_tbl.columns[3].width = Inches(2.2)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)
    
    add_callout_box(
        doc,
        "Normativa Estricta de Estadía Empresarial (Reglamento UNID)",
        "Para que un estudiante sea dictaminado como '100% APROBADO / ELEGIBLE PARA ESTADÍA Y TITULACIÓN', "
        "no debe registrar ninguna asignatura en ADEUDO ACTIVO ni en calidad de OMITIDA de 1.º a 6.º cuatrimestre. "
        "Si existe una sola materia reprobada en dicho rango, el dictamen cambiará automáticamente a "
        "'RETENIDO POR ADEUDO ACADÉMICO' y se bloqueará la asignación de empresa.",
        box_type="warning"
    )

    # =========================================================================
    # CAPÍTULO 6: EMISIÓN Y DESCARGA DE DOCUMENTOS OFICIALES EN PDF
    # =========================================================================
    add_heading_1("6. EMISIÓN Y DESCARGA DE DOCUMENTOS OFICIALES EN PDF")
    
    add_body(
        "El sistema genera dos documentos oficiales vectorizados y optimizados para impresión:"
    )
    
    add_heading_2("6.1 Cédula Oficial de Auditoría (Formato de 2 Hojas)")
    add_body(
        "Al pulsar el botón 'Imprimir Cédula Oficial' o 'Descargar PDF':"
    )
    add_bullet("Hoja 1 (Mapa de Ejecución)", "Imprime la cuadrícula completa de cuatrimestres con sus materias acreditadas, promedio y el catálogo de electivas y nomenclatura expandidos automáticamente.")
    add_bullet("Hoja 2 (Cédula de Auditoría y Trazabilidad)", "Imprime el desglose de créditos, la bitácora de materias recursadas y los recuadros oficiales de validación y firma de la Coordinación.")

    add_heading_2("6.2 Sábana Ejecutiva Grupal (Batch Report)")
    add_body(
        "Desde la vista 'Auditoría Grupal (Lote)', presione 'Descargar Sábana Ejecutiva'. Se generará un "
        "documento en orientación horizontal con el membrete institucional de UNID, tabulación ordenada "
        "por apellidos de los estudiantes, matrícula, cuatrimestre, porcentaje de avance, créditos y estatus normativo."
    )

    # =========================================================================
    # CAPÍTULO 7: CATÁLOGO DE PROGRAMAS SOPORTADOS
    # =========================================================================
    add_heading_1("7. CATÁLOGO DE LOS 14 PROGRAMAS INSTITUCIONALES")
    
    add_body(
        "El sistema tiene parametrizados y homologados al 100% los planes de estudio y RVOE oficiales "
        "distribuidos entre las coordinaciones de la Sede CAM:"
    )
    
    carreras_data = [
        ("LIC-COFI-18", "Lic. en Contabilidad y Finanzas (Mixto) - Plan 2018", "Laura Ara Angulo", "37"),
        ("LIC-DAEM-18", "Lic. en Administración y Dirección Empresarial - Dual", "Laura Ara Angulo", "46"),
        ("LIC-EJCO-17", "Lic. Ejecutiva en Contabilidad Financiera - Modular", "Laura Ara Angulo", "44"),
        ("LIC-ARQU-18", "Lic. en Arquitectura (Mixto) - Plan 2018", "Yessica Inurreta", "37"),
        ("LIC-DERE-18", "Lic. en Derecho y Ciencias Jurídicas (Mixto)", "Yessica Inurreta", "37"),
        ("LIC-EJDE-17", "Lic. Ejecutiva en Derecho (Modular)", "Yessica Inurreta", "44"),
        ("LIC-EJED-17", "Lic. Ejecutiva en Educación y Tecnologías del Aprendizaje", "Yessica Inurreta", "44"),
        ("LIC-EDFI-18", "Lic. en Educación Física, Recreación y Deporte (Mixto)", "Yessica Inurreta", "37"),
        ("LIC-DSGD-18", "Lic. en Diseño Gráfico Digital (Mixto)", "Avelina García", "37"),
        ("LIC-EJAD-17", "Lic. Ejecutiva en Administración de Empresas (Modular)", "Avelina García", "49"),
        ("LIC-MEES-18", "Lic. en Mercadotecnia Estratégica (Mixto)", "Avelina García", "37"),
        ("LIC-SYSC-18", "Lic. en Ing. de Software y Sistemas Computacionales", "Avelina García", "37"),
        ("LIC-ADME-18", "Lic. en Administración Empresarial (Mixto)", "Avelina García", "37"),
        ("LIC-CTCO-18", "Lic. en Ciencias y Técnicas de la Comunicación (Mixto)", "Coordinación CAM", "37")
    ]
    
    c_tbl = doc.add_table(rows=len(carreras_data) + 1, cols=4)
    c_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_headers = ["Clave Plan", "Nombre Oficial del Programa", "Coordinación Responsable", "Materias"]
    for i, h_text in enumerate(c_headers):
        c = c_tbl.rows[0].cells[i]
        set_cell_background(c, "1E293B")
        set_cell_margins(c, top=80, bottom=80, left=80, right=80)
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    for idx, (cod, nom, coord, mats) in enumerate(carreras_data):
        row = c_tbl.rows[idx + 1]
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([cod, nom, coord, mats]):
            c = row.cells[i]
            set_cell_background(c, bg)
            set_cell_margins(c, top=60, bottom=60, left=80, right=80)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(8.5)
            if i == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(15, 23, 42)
            else:
                r.font.color.rgb = RGBColor(51, 65, 85)
                
    c_tbl.columns[0].width = Inches(1.3)
    c_tbl.columns[1].width = Inches(2.7)
    c_tbl.columns[2].width = Inches(1.7)
    c_tbl.columns[3].width = Inches(0.8)

    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 8: SOLUCIÓN DE PROBLEMAS Y SOPORTE TÉCNICO
    # =========================================================================
    add_heading_1("8. SOLUCIÓN DE PROBLEMAS FRECUENTES Y SOPORTE TÉCNICO")
    
    faqs = [
        ("¿Qué hacer si un alumno ya aprobó una materia pero en el kárdex de Banner aparece en adeudo?",
         "El sistema audita con base en la verdad documental del archivo PDF expedido. Si el alumno acreditó mediante un examen reciente o acta fuera de tiempo no reflejada en Banner, la coordinación puede actualizar el kárdex emitiendo una nueva versión desde Banner o revisar la bitácora de intentos."),
        
        ("¿Por qué el sistema alerta sobre 'Desfase de Programa Académico'?",
         "Ocurre cuando el kárdex cargado pertenece a una carrera distinta a la seleccionada en la cabecera superior (ejemplo: se tenía seleccionada Contabilidad pero se subió un kárdex de Derecho). El modal interactivo le permite con un solo clic ajustar el sistema a la carrera correcta."),
        
        ("¿Qué sucede si se interrumpe la conexión a Internet o a Neon Database?",
         "El sistema cuenta con tolerancia total a fallos (Modo de Contingencia Local). Puede seguir procesando kárdex, visualizando el mapa y generando cédulas en PDF sin interrupciones, ya que todo el motor analítico se ejecuta en el navegador."),
        
        ("¿Cómo se respaldan las auditorías de todo un ciclo escolar?",
         "Al finalizar la auditoría de un grupo, presione 'Guardar en Base de Datos' en el modal de Neon. Esto almacena de forma estructurada los dictámenes en los servidores de Neon PostgreSQL, disponibles para consulta durante 5 meses.")
    ]
    
    for preg, resp in faqs:
        add_bullet("Pregunta: " + preg, resp)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)
        
    add_callout_box(
        doc,
        "Canal de Soporte Institucional",
        "Para solicitudes de incorporación de nuevos planes de estudio, aclaraciones normativas o incidencias "
        "técnicas de acceso a la plataforma, contacte al Administrador del Sistema:\n"
        "• Correo de Soporte: control_academico.devs@hotmail.com / coordinacion.cam@unid.mx\n"
        "• Coordinación Académica UNID Sede Campeche",
        box_type="info"
    )

    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 9: LIMITANTES DE HOSPEDAJE Y RECOMENDACIONES OPERATIVAS
    # =========================================================================
    add_heading_1("9. LIMITANTES DE HOSPEDAJE Y RECOMENDACIONES OPERATIVAS")

    add_body(
        "Para garantizar la máxima transparencia con los coordinadores y directivos, este apartado "
        "detalla las características y limitaciones de la infraestructura tecnológica actual en la nube. "
        "La plataforma opera bajo un modelo de hospedaje ágil y eficiente (Frontend en Vercel Edge y Backend "
        "en Neon Serverless PostgreSQL), lo cual permite que la sede disponga de una herramienta sin costos "
        "de servidores físicos dedicados, pero exige contemplar ciertas condiciones operativas para su uso óptimo."
    )

    add_heading_2("9.1 Limitantes del Backend y Base de Datos (Neon Serverless PostgreSQL)")
    add_body(
        "La persistencia de auditorías se realiza en un clúster serverless de PostgreSQL administrado por Neon. "
        "Este entorno presenta las siguientes particularidades técnicas:"
    )

    add_bullet(
        "Suspensión por Inactividad (Cold Start o 'Despertar de Servidor')",
        "En el plan serverless de Neon, la máquina virtual entra en suspensión automática tras 5 minutos continuos "
        "sin consultas para conservar horas de cómputo. Cuando un coordinador ingresa al inicio de la jornada "
        "o tras un periodo de inactividad, la primera consulta a la base de datos (por ejemplo, abrir el Gestor de Ciclos) "
        "puede experimentar una demora de 1.5 a 3.5 segundos mientras la instancia se reactiva. Una vez despierta, "
        "todas las consultas posteriores responden a ultra-baja latencia (menos de 100 milisegundos)."
    )

    add_bullet(
        "Tope de Almacenamiento Estructurado (500 MB)",
        "El servidor cuenta con una capacidad máxima de 0.5 GB. Por esta razón crítica, el sistema NUNCA almacena "
        "los archivos PDF pesados dentro de la base de datos (lo que saturaría el disco en semanas), sino únicamente "
        "los dictámenes académicos estructurados en formato JSON comprimido. Asimismo, esta limitante fundamenta "
        "la 'Política de Depuración Automática a los 5 Meses', diseñada para depurar registros obsoletos de ciclos pasados."
    )

    add_bullet(
        "Límite de Horas de Cómputo (100 Compute Hours / Mes)",
        "El clúster dispone de 100 horas de cómputo activo mensuales. Gracias a que el motor se suspende tras 5 minutos "
        "de inactividad, la cuota es más que suficiente para la operación cotidiana de la Sede CAM. Sin embargo, no deben "
        "ejecutarse scripts automáticos continuos que impidan el reposo del servidor."
    )

    add_bullet(
        "Conexiones Concurrentes y Pooler de Conexiones",
        "El sistema se conecta a través del Neon Serverless Connection Pooler (PgBouncer integrado en puerto seguro). "
        "Esto previene la saturación por múltiples ventanas abiertas, pero está dimensionado para la labor de "
        "coordinación institucional (hasta 20 usuarios simultáneos), no para tráfico masivo de miles de peticiones por segundo."
    )

    add_callout_box(
        doc,
        "Implicación Práctica en Base de Datos",
        "Tenga paciencia durante la primera consulta del día: esos 2 segundos iniciales corresponden al encendido "
        "automático de Neon PostgreSQL. Si observa el punto pulsante verde en la barra lateral ('Serverless Pooler Online'), "
        "significa que el servidor ya se encuentra despierto y listo para operar a máxima velocidad.",
        box_type="warning"
    )

    add_heading_2("9.2 Limitantes del Frontend y Navegador del Usuario (Vercel & Cliente)")
    add_body(
        "La interfaz de usuario se distribuye globalmente a través de la red perimetral de Vercel. "
        "Sus características de operación son las siguientes:"
    )

    add_bullet(
        "Procesamiento en Memoria RAM Local (Web Workers de PDF.js)",
        "A diferencia de sistemas antiguos que suben los PDFs a un servidor para procesarlos, este sistema analiza "
        "los kárdex DIRECTAMENTE en la memoria RAM de la computadora del coordinador mediante hilos secundarios (Web Workers). "
        "Esto ofrece máxima confidencialidad (el PDF nunca sale de su equipo), pero si la computadora de la oficina "
        "cuenta con 4 GB de memoria RAM o menos y se arrastran 100 o más kárdex al mismo tiempo, el navegador "
        "puede experimentar lentitud temporal."
    )

    add_bullet(
        "Tamaño de Lote Recomendado (Batch Processing)",
        "Para computadoras de oficina estándar, se recomienda procesar los grupos en lotes de 25 a 50 alumnos por vez. "
        "Esto asegura una respuesta instantánea y previene el consumo excesivo de memoria del navegador."
    )

    add_bullet(
        "Actualizaciones de Versión y Caché del Navegador",
        "Al publicarse una mejora en Vercel, si el navegador web del usuario mantiene en memoria versiones anteriores "
        "de los archivos JavaScript, podría mostrar estilos desactualizados. En tal caso, basta con realizar una "
        "recarga forzada pulsando 'Ctrl + Shift + R' en Windows o 'Cmd + Shift + R' en Mac."
    )

    add_heading_2("9.3 Modo de Contingencia Local (Tolerancia Total a Fallos)")
    add_body(
        "Una de las fortalezas clave de la arquitectura es que el Frontend NO depende rígidamente de Neon Database "
        "para dictaminar expedientes. Si en algún momento la base de datos estuviera suspendida, sin conexión o "
        "agotara su cuota mensual:"
    )
    add_bullet("Operación Ininterrumpida", "El sistema conmuta de inmediato a 'Modo Local Oficial'. Los coordinadores pueden seguir cargando kárdex, auditando asignaturas, revisando el mapa curricular y descargando la Cédula Oficial y la Sábana Grupal en PDF.")
    add_bullet("Única Función Afectada", "Solo se deshabilita temporalmente el guardado remoto en la nube, pero ningún trámite académico urgente se detiene.")

    add_heading_2("9.4 Matriz de Buenas Prácticas para Coordinadores y Usuarios")

    best_practices = [
        ("Primera consulta del día lenta (2-3 seg.)", "Servidor Neon en estado de reposo (Cold Start).", "Esperar un par de segundos; la base de datos se activa automáticamente."),
        ("Lote grupal tarda en responder al cargar 150 PDFs", "Saturación de memoria RAM en el navegador local.", "Cargar y auditar por grupos o cuatrimestres (bloques de 30 a 50 kárdex)."),
        ("Aviso de cuota de almacenamiento cercana al límite", "Acumulación de auditorías de ciclos pasados en Neon.", "Abrir el Gestor de Base de Datos y pulsar 'Depurar registros con más de 5 meses'."),
        ("Pantalla no refleja un cambio reciente del sistema", "Caché temporal del navegador conservando scripts previos.", "Presionar Ctrl + F5 (Windows) o Cmd + Shift + R (Mac) para refrescar."),
        ("Sin conexión a internet o sin acceso a Neon DB", "Corte local de red en campus o mantenimiento de Neon.", "Continuar trabajando normalmente; el motor opera al 100% en modo local de contingencia.")
    ]

    bp_tbl = doc.add_table(rows=len(best_practices) + 1, cols=3)
    bp_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    bp_headers = ["Situación Detectada", "Causa Técnica de Infraestructura", "Acción Recomendada para el Usuario"]
    for i, h_text in enumerate(bp_headers):
        c = bp_tbl.rows[0].cells[i]
        set_cell_background(c, "0F172A")
        set_cell_margins(c, top=80, bottom=80, left=80, right=80)
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for idx, (sit, causa, accion) in enumerate(best_practices):
        row = bp_tbl.rows[idx + 1]
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([sit, causa, accion]):
            c = row.cells[i]
            set_cell_background(c, bg)
            set_cell_margins(c, top=60, bottom=60, left=80, right=80)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(8.5)
            if i == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(15, 23, 42)
            else:
                r.font.color.rgb = RGBColor(51, 65, 85)

    bp_tbl.columns[0].width = Inches(2.1)
    bp_tbl.columns[1].width = Inches(2.0)
    bp_tbl.columns[2].width = Inches(2.4)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # Guardar documento
    output_docx = "MANUAL_DE_USUARIO_SISTEMA_UNID.docx"
    output_doc = "MANUAL_DE_USUARIO_SISTEMA_UNID.doc"
    doc.save(output_docx)
    
    # También crear una copia con extensión .doc para máxima compatibilidad con lo solicitado por el usuario
    import shutil
    shutil.copyfile(output_docx, output_doc)
    
    print(f"Manual generado exitosamente:")
    print(f"1. {os.path.abspath(output_docx)}")
    print(f"2. {os.path.abspath(output_doc)}")

if __name__ == "__main__":
    build_manual()

