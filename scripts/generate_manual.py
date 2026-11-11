#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del Manual de Usuario Oficial en formato Microsoft Word (.docx / .doc)
para el Sistema de Auditoría Curricular y Validación de Estadía de UNID.
Actualizado a v2026.1 Enterprise con los 18 programas académicos,
modo consulta de plan base, pestañas dinámicas y eliminación de requisitos obsoletos.
"""

import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

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
        "gold": {"bg": "FFFDF0", "border": "F2B705", "title_color": RGBColor(194, 120, 3)},
        "emerald": {"bg": "ECFDF5", "border": "059669", "title_color": RGBColor(5, 150, 105)}
    }
    cfg = colors.get(box_type, colors["info"])
    
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, cfg["bg"])
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    cell.width = Inches(6.5)
    
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
    
    # Configuración de márgenes estándar (1 pulgada = 2.54 cm)
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
    p_logo.paragraph_format.space_before = Pt(36)
    p_logo.paragraph_format.space_after = Pt(16)
    
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
    r_suborg.font.color.rgb = RGBColor(217, 119, 6) # Amber UNID
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("MANUAL OFICIAL DE USUARIO\nSISTEMA DE AUDITORÍA CURRICULAR Y VALIDACIÓN DE ESTADÍA")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(21)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
    
    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_before = Pt(6)
    p_desc.paragraph_format.space_after = Pt(32)
    r_desc = p_desc.add_run(
        "Guía Integral de Operación, Mallas Curriculares Oficiales de Consulta,\n"
        "Criterios de Dictamen, Asistente con IA y Persistencia en Neon PostgreSQL\n"
        "(18 Programas Académicos: 14 Licenciaturas y 4 Maestrías PAC)"
    )
    r_desc.font.name = "Calibri"
    r_desc.font.size = Pt(10.5)
    r_desc.font.color.rgb = RGBColor(71, 85, 105)
    
    # Tabla de Metadatos de la Portada
    meta_tbl = doc.add_table(rows=6, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Institución:", "Universidad Interamericana para el Desarrollo (UNID)"),
        ("Sede / Campus:", "Sede Campeche (CAM) · Zona Sureste"),
        ("Área Responsable:", "Coordinaciones de Licenciaturas y Posgrados"),
        ("Programas Soportados:", "18 Carreras (14 Licenciaturas Mixtas/Ejecutivas + 4 Maestrías PAC)"),
        ("Versión del Sistema:", "v2026.1 Enterprise · RVOE Federal Vigente"),
        ("Fecha de Actualización:", "Noviembre de 2026")
    ]
    for idx, (label, val) in enumerate(meta_data):
        row = meta_tbl.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        set_cell_background(cell_lbl, "F1F5F9")
        set_cell_background(cell_val, "F8FAFC")
        set_cell_margins(cell_lbl, top=70, bottom=70, left=120, right=120)
        set_cell_margins(cell_val, top=70, bottom=70, left=120, right=120)
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
    
    # Encabezado y Pie de Página
    body_section = doc.sections[0]
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
        h.paragraph_format.space_before = Pt(20)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(15)
        r.bold = True
        r.font.color.rgb = RGBColor(15, 23, 42)
        
        p_line = doc.add_paragraph()
        p_line.paragraph_format.space_before = Pt(0)
        p_line.paragraph_format.space_after = Pt(10)
        r_line = p_line.add_run("—" * 55)
        r_line.font.name = "Calibri"
        r_line.font.size = Pt(9)
        r_line.font.color.rgb = RGBColor(217, 119, 6)
        return h

    def add_heading_2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(12)
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
        ("4. Módulos y Pantallas de la Plataforma", "7"),
        ("   4.1 Modo Plan Oficial Base (Consulta Curricular sin Alumno)", "7"),
        ("   4.2 Pestañas Dinámicas (Modo Consulta vs. Modo Auditoría)", "8"),
        ("   4.3 Hoja 1: Mapa Curricular Interactivo y Validación", "9"),
        ("   4.4 Hoja 2: Cédula Oficial de Auditoría y Trazabilidad", "11"),
        ("   4.5 Eliminación de Requisitos Obsoletos de Egreso y Titulación", "12"),
        ("   4.6 Directorio Consolidado de Grupo (Auditoría Masiva)", "13"),
        ("   4.7 Asistente Académico Inteligente (Botón Flotante FAB)", "14"),
        ("   4.8 Gestor de Base de Datos y Persistencia en Neon PostgreSQL", "15"),
        ("   4.9 Micro-Cockpit de Telemetría en Barra Lateral", "16"),
        ("   4.10 Módulo de Gestión de Usuarios y Roles RBAC", "17"),
        ("5. Matriz de Estados Curriculares y Reglas de Negocio", "18"),
        ("6. Emisión y Descarga de Documentos Oficiales en PDF", "19"),
        ("7. Catálogo Oficial de los 18 Programas (Licenciaturas y Maestrías)", "20"),
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
        set_cell_margins(c0, top=35, bottom=35, left=60, right=60)
        set_cell_margins(c1, top=35, bottom=35, left=60, right=60)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        run0 = p0.add_run(cap)
        run0.font.name = "Calibri"
        run0.font.size = Pt(9.5)
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
        "A partir de la actualización v2026.1, la plataforma incorpora el catálogo integral de los 18 "
        "programas académicos (14 Licenciaturas y 4 Maestrías PAC), un Visor Curricular Oficial Base "
        "para consultar cualquier malla de estudios sin necesidad de subir expedientes, un Asistente "
        "Académico Inteligente accesible mediante botón flotante (FAB) y una interfaz con modo oscuro "
        "institucional de alto contraste."
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
    add_bullet("Visor Oficial de Malla Curricular Base", "Permite explorar la malla curricular oficial completa de las 18 carreras con claves, créditos, cuatrimestres e insignias Conecta sin necesidad de cargar un kárdex.")
    add_bullet("Extracción Espacial Banner (PDF.js)", "Lee directamente los documentos oficiales de Banner sin OCR, garantizando 100% de precisión en calificaciones y claves.")
    add_bullet("Auditoría Individual y Masiva (Batch)", "Permite auditar el expediente de un solo alumno o procesar simultáneamente carpetas con decenas de kárdex de un grupo completo.")
    add_bullet("Detección Automática de Modalidad", "Reconoce de manera autónoma si el estudiante cursa Modalidad Escolarizada, Mixta, Ejecutiva o Maestría.")
    add_bullet("Requisitos de Titulación Actualizados", "Eliminación de cursos co-curriculares no requeridos (Ortografía, Comprensión Lectora y EGEL); foco estricto en los 5 niveles de inglés curricular.")
    add_bullet("Asistente Académico Inteligente con IA", "Botón flotante que responde dudas normativas con Gemini Flash y consulta expedientes en tiempo real sobre Neon DB sin exponer datos privados de alumnos.")
    add_bullet("Persistencia Serverless en Neon PostgreSQL", "Almacena los lotes completos por ciclo escolar y cuatrimestre para consulta histórica y auditorías posteriores.")

    # =========================================================================
    # CAPÍTULO 2: SEGURIDAD Y CONTROL DE ACCESO
    # =========================================================================
    add_heading_1("2. POLÍTICAS DE SEGURIDAD Y CONTROL DE ACCESO")
    
    add_body(
        "El sistema opera bajo los estándares de seguridad de grado corporativo de UNID:"
    )
    add_bullet("Autenticación con Microsoft Entra ID (Azure AD)", "Acceso federado oficial mediante Single Sign-On con cuenta institucional.")
    add_bullet("Restricción Estricta de Dominio", "Bloqueo total a cualquier cuenta de correo ajena al dominio oficial @unid.mx.")
    add_bullet("Control de Roles RBAC", "Facultades diferenciadas para ADMIN_SISTEMA, COORDINADOR, CONTROL_ESCOLAR, DIRECTOR y CONSULTA.")
    add_bullet("Temporizador de Inactividad (5 Minutos)", "Cierre automático de sesión tras 5 minutos de inactividad para proteger expedientes en computadoras compartidas.")
    add_bullet("Consola de Seguridad Forense (/admin/seguridad)", "Supervisión de hardware certificado (Device Fingerprinting), geolocalización GPS y bitácora de eventos en tiempo real.")

    # =========================================================================
    # CAPÍTULO 3: FLUJO OPERATIVO PASO A PASO
    # =========================================================================
    add_heading_1("3. FLUJO OPERATIVO PASO A PASO (GUÍA RÁPIDA)")
    
    pasos = [
        ("Paso 1: Inicio de Sesión", "Abra la plataforma e inicie sesión con su cuenta institucional de Microsoft 365 (@unid.mx)."),
        ("Paso 2: Selección de Carrera o Programa", "En el menú superior, elija cualquiera de los 18 programas divididos por coordinación (Laura, Avelina, Yessica o Posgrados). La malla curricular oficial de la carrera seleccionada se desplegará al instante."),
        ("Paso 3: Carga de Kárdex", "Haga clic en 'Auditar Kárdex' o 'Subir Kárdex' (o arrastre uno o varios archivos PDF de Banner). El motor procesará las calificaciones y actualizará el mapa a modo auditoría."),
        ("Paso 4: Validación en Mapa Curricular", "Revise las materias acreditadas (verde), recursadas (ámbar), en curso (azul) o adeudos activos (rojo)."),
        ("Paso 5: Emisión de Cédula Oficial", "Cambie a la pestaña 'Hoja 2: Cédula de Auditoría' para revisar el dictamen legal y descargar el PDF certificado de 2 hojas para firmas."),
        ("Paso 6: Guardado en Base de Datos", "Presione 'Guardar en Base de Datos' en el modal de Neon para archivar el lote bajo el ciclo escolar correspondiente.")
    ]
    for p_tit, p_desc in pasos:
        add_bullet(p_tit, p_desc)
        
    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 4: MÓDULOS Y PANTALLAS DE LA PLATAFORMA
    # =========================================================================
    add_heading_1("4. MÓDULOS Y PANTALLAS DE LA PLATAFORMA")
    
    add_heading_2("4.1 Modo Plan Oficial Base (Consulta Curricular sin Alumno)")
    add_body(
        "Al ingresar a la plataforma o cambiar de programa en el selector de carreras sin haber subido "
        "un kárdex, el sistema activa automáticamente el Modo Plan Oficial Base. Esta funcionalidad "
        "presenta de manera inmediata la Malla Curricular Oficial completa del programa seleccionado:"
    )
    add_bullet("Estructura de Cuatrimestres", "Presenta los 9 cuatrimestres reglamentarios (5 en maestrías o 10 en DAEM Dual), con el nombre oficial de cada materia, código Banner, créditos curriculares e insignias Conecta (materias virtuales institucionales).")
    add_bullet("Cintilla de Metadatos del Plan", "Muestra el código del plan oficial, modalidad (Mixta, Modular o Posgrado), coordinación responsable y botón directo [ ⬆ Auditar Kárdex ] para subir expedientes sobre ese plan con 1 clic.")
    add_bullet("Interacción con Asignaturas", "Al hacer clic sobre cualquier materia de la malla en modo consulta, se abre una ventana modal con la descripción de la asignatura, modalidad y requisitos.")

    add_heading_2("4.2 Pestañas Dinámicas (Modo Consulta vs. Modo Auditoría)")
    add_body(
        "Para evitar confusiones en pantalla y ofrecer una interfaz limpia, el conmutador de vistas adapta "
        "sus etiquetas y funciones de forma inteligente según el estado de la sesión:"
    )
    add_bullet("En Modo Consulta (Sin Alumno Cargado)", "La barra muestra las pestañas 'Malla Curricular Oficial' (para explorar el plan) y 'Auditar Alumno (Subir Kárdex)' (con tarjeta guiada de carga).")
    add_bullet("En Modo Auditoría (Con Alumno Cargado)", "Al subir el expediente, las pestañas conmutan automáticamente a las dos fojas legales oficiales: 'Hoja 1: Mapa de Ejecución' y 'Hoja 2: Cédula de Auditoría', activando además la barra de filtros por oportunidad (Ordinarias, Recursadas, Modo RE, Adeudos).")

    add_heading_2("4.3 Hoja 1: Mapa Curricular Interactivo y Validación")
    add_body(
        "Proyecta la trayectoria real del alumno sobre el plan oficial de la carrera:"
    )
    add_bullet("Principio de Diseño por Excepción", "Las materias acreditadas ordinarias se muestran limpias con borde verde esmeralda. Solo las incidencias o adeudos resaltan con colores de alerta.")
    add_bullet("Requisito de Inglés Curricular (1.º al 5.º)", "Fila transversal inferior alineada bajo las columnas 1 a 5 con los niveles LENG-F001 a F005, o indicación de exención formal (LENG-0008).")

    add_heading_2("4.4 Hoja 2: Cédula Oficial de Auditoría y Trazabilidad")
    add_body(
        "Documento oficial de dictamen académico, configurado con dimensiones exactas para firma institucional:"
    )
    add_bullet("Resumen Cuantitativo en 3 KPIs Principales", "Muestra Avance de Plan (materias aprobadas / total), Inglés Curricular (niveles acreditados / 5) y Promedio General Ponderado.")
    add_bullet("Dictamen Normativo Institucional", "Caja destacada que certifica en texto legal si el expediente se encuentra '100% APROBADO / ELEGIBLE PARA ESTADÍA Y TITULACIÓN' o 'RETENIDO POR ADEUDO ACADÉMICO'.")
    add_bullet("Bitácora Forense de Incidencias", "Tabla que desglosa materias recursadas, exámenes extraordinarios (Modo RE) y periodos cursados.")

    add_heading_2("4.5 Eliminación de Requisitos Obsoletos de Egreso y Titulación")
    add_body(
        "En concordancia con los lineamientos vigentes de Coordinación y Control Escolar de UNID, se "
        "retiraron los cursos co-curriculares no obligatorios (Ortografía MPD-CMS02, Comprensión Lectora "
        "MPD-CMS03 y Curso de Preparación EGEL I CUPR-EG). Dichos cursos ya no forman parte de los requisitos "
        "de titulación institucional, garantizando que ningún alumno sea retenido indebidamente por su ausencia."
    )

    add_heading_2("4.6 Directorio Consolidado de Grupo (Auditoría Masiva - Batch View)")
    add_body(
        "Permite procesar carpetas completas de kárdex, mostrando una tabla ejecutiva con buscador en vivo, "
        "indicadores globales de la generación y exportación de la Sábana Ejecutiva Oficial en PDF y Excel."
    )

    add_heading_2("4.7 Asistente Académico Inteligente (Botón Flotante FAB)")
    add_body(
        "Ubicado en la esquina inferior derecha mediante un botón flotante estilizado con la leyenda 'Asistente UNID':"
    )
    add_bullet("Consultas Seguras y Privadas", "Las búsquedas de alumnos, carreras y ciclos se resuelven en milisegundos directamente en Neon PostgreSQL, sin enviar datos confidenciales de alumnos a proveedores de IA.")
    add_bullet("Apertura en Pantalla Completa", "Puede solicitar al asistente 'abre el kardex de 00312175' o 'abre el grupo de Contabilidad' para conmutar la pantalla principal de forma automática.")
    add_bullet("Estándar Sobrio Sin Emojis", "Opera bajo un estándar institucional estricto, empleando tipografía limpia y viñetas corporativas.")

    add_heading_2("4.8 Gestor de Base de Datos y Persistencia en Neon PostgreSQL")
    add_body(
        "Permite archivar grupos por ciclo escolar (ej. 2026-1) y recuperarlos en cualquier momento sin volver "
        "a pedir los PDFs. Incluye la utilidad de mantenimiento para depurar auditorías con más de 5 meses de antigüedad."
    )

    add_heading_2("4.9 Micro-Cockpit de Telemetría en Barra Lateral")
    add_body(
        "Monitorea el estado de la conexión en la nube mediante un punto pulsante verde ('Serverless Pooler Online'), "
        "dando acceso directo con 1 clic al Gestor de Base de Datos."
    )

    add_heading_2("4.10 Módulo de Gestión de Usuarios y Roles RBAC")
    add_body(
        "Disponible en la Consola de Seguridad (/admin/seguridad) para administrar altas, bajas preventivas "
        "y relevos de coordinadoras sin tocar el código fuente de la aplicación."
    )

    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 5: MATRIZ DE ESTADOS CURRICULARES
    # =========================================================================
    add_heading_1("5. MATRIZ DE ESTADOS CURRICULARES Y REGLAS DE NEGOCIO")
    
    matriz_data = [
        ("ORD", "1.ª Oportunidad Ordinaria", "Verde Esmeralda", "Asignatura aprobada en su primera inscripción formal."),
        ("REC", "Recursamiento Acreditado", "Ámbar Institucional", "Asignatura aprobada tras registrar uno o más periodos previos reprobados."),
        ("RE", "Regularización / Extraordinario", "Azul Institucional", "Materia acreditada mediante examen extraordinario o proceso de regularización."),
        ("CURS", "En Curso Activo", "Gris Frío con Borde Azul", "Asignatura inscrita en el periodo escolar activo sin calificación numérica definitiva."),
        ("REC·CURSO", "Recursamiento en Curso", "Púrpura", "Asignatura inscrita actualmente que registra antecedentes previos reprobatorios."),
        ("ADEUDO", "Reprobada Activa (Adeudo)", "Rojo Carmesí", "Último intento registrado con estatus reprobatorio (calificación menor a 6.0 en licenciatura o menor a 7.0 en maestría). Bloquea Estadía."),
        ("OMITIDA", "Asignatura No Cursada", "Naranja", "Materia sin inscripción cuyo cuatrimestre curricular ya fue alcanzado por el avance del alumno. Bloquea Estadía."),
        ("PEND.", "Pendiente Curricular", "Gris Punteado", "Materia perteneciente a cuatrimestres futuros respecto a la trayectoria del estudiante.")
    ]
    
    m_tbl = doc.add_table(rows=len(matriz_data) + 1, cols=4)
    m_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Código", "Denominación Oficial", "Identificador Visual", "Criterio de Dictamen"]
    for i, h_text in enumerate(headers):
        c = m_tbl.rows[0].cells[i]
        set_cell_background(c, "0F172A")
        set_cell_margins(c, top=80, bottom=80, left=80, right=80)
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    for idx, (cod, den, col, crit) in enumerate(matriz_data):
        row = m_tbl.rows[idx + 1]
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([cod, den, col, crit]):
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
                
    m_tbl.columns[0].width = Inches(1.1)
    m_tbl.columns[1].width = Inches(1.8)
    m_tbl.columns[2].width = Inches(1.4)
    m_tbl.columns[3].width = Inches(2.2)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # =========================================================================
    # CAPÍTULO 6: EMISIÓN Y DESCARGA DE DOCUMENTOS OFICIALES EN PDF
    # =========================================================================
    add_heading_1("6. EMISIÓN Y DESCARGA DE DOCUMENTOS OFICIALES EN PDF")
    
    add_body("El sistema permite exportar en un clic dos documentos oficiales:")
    add_bullet("Cédula Oficial de Auditoría (2 Hojas)", "Hoja 1 con el mapa curricular interactivo y Hoja 2 con la cédula de trazabilidad, promedios y firmas institucionales.")
    add_bullet("Sábana Ejecutiva Grupal (Batch Report)", "Relación horizontal consolidada de la generación completa para control escolar y comités de titulación.")

    # =========================================================================
    # CAPÍTULO 7: CATÁLOGO DE LOS 18 PROGRAMAS INSTITUCIONALES
    # =========================================================================
    add_heading_1("7. CATÁLOGO OFICIAL DE LOS 18 PROGRAMAS ACADÉMICOS")
    
    add_body(
        "El sistema tiene parametrizados y homologados al 100% los 18 planes de estudio y RVOE oficiales "
        "de UNID, clasificados por coordinación académica con colores semánticos en el menú desplegable:"
    )
    
    carreras_data = [
        # Laura (Púrpura)
        ("LIC-COFI-18", "Lic. en Contabilidad y Finanzas (Mixto) - Plan 2018", "Laura Ara (Económico-Adm.)", "37"),
        ("LIC-DAEM-18", "Lic. en Administración y Dirección Empresarial - Dual", "Laura Ara (Económico-Adm.)", "46"),
        ("LIC-EJCO-17", "Lic. Ejecutiva en Contabilidad Financiera - Modular", "Laura Ara (Económico-Adm.)", "44"),
        # Yessica (Naranja)
        ("LIC-ARQU-18", "Lic. en Arquitectura (Mixto) - Plan 2018", "Yessica Inurreta (Arq., Der., Edu.)", "37"),
        ("LIC-DERE-18", "Lic. en Derecho y Ciencias Jurídicas (Mixto)", "Yessica Inurreta (Arq., Der., Edu.)", "37"),
        ("LIC-EJDE-17", "Lic. Ejecutiva en Derecho (Modular)", "Yessica Inurreta (Arq., Der., Edu.)", "44"),
        ("LIC-EJED-17", "Lic. Ejecutiva en Educación y Tecnologías del Aprendizaje", "Yessica Inurreta (Arq., Der., Edu.)", "44"),
        ("LIC-EDFI-18", "Lic. en Educación Física, Recreación y Deporte (Mixto)", "Yessica Inurreta (Arq., Der., Edu.)", "37"),
        # Avelina (Rosa)
        ("LIC-DSGD-18", "Lic. en Diseño Gráfico Digital (Mixto)", "Avelina García (Diseño, Adm., Ing.)", "37"),
        ("LIC-EJAD-17", "Lic. Ejecutiva en Administración de Empresas (Modular)", "Avelina García (Diseño, Adm., Ing.)", "49"),
        ("LIC-MEES-18", "Lic. en Mercadotecnia Estratégica (Mixto)", "Avelina García (Diseño, Adm., Ing.)", "37"),
        ("LIC-SYSC-18", "Lic. en Ing. de Software y Sistemas Computacionales", "Avelina García (Diseño, Adm., Ing.)", "37"),
        ("LIC-ADME-18", "Lic. en Administración Empresarial (Mixto)", "Avelina García (Diseño, Adm., Ing.)", "37"),
        ("LIC-CTCO-18", "Lic. en Ciencias y Técnicas de la Comunicación (Mixto)", "Avelina García (Diseño, Adm., Ing.)", "37"),
        # Posgrados y Maestrías (Verde Esmeralda)
        ("MAE-EDUP-22", "Maestría en Educación (PAC)", "Coordinación de Posgrados", "15"),
        ("MAE-MADP-22", "Maestría en Administración de Negocios (PAC)", "Coordinación de Posgrados", "15"),
        ("MAE-MDEC-20", "Maestría en Derecho Constitucional y Amparo (Mixta)", "Coordinación de Posgrados", "15"),
        ("MAE-MERP-22", "Maestría en Mercadotecnia y Medios Digitales (PAC)", "Coordinación de Posgrados", "15")
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
    c_tbl.columns[2].width = Inches(1.8)
    c_tbl.columns[3].width = Inches(0.7)

    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 8: SOLUCIÓN DE PROBLEMAS Y SOPORTE
    # =========================================================================
    add_heading_1("8. SOLUCIÓN DE PROBLEMAS FRECUENTES Y SOPORTE TÉCNICO")
    
    faqs = [
        ("¿Por qué al entrar veo materias si aún no he cargado un kárdex?",
         "Es la Malla Curricular Oficial de Consulta. El sistema ahora le permite revisar cualquier plan de estudios oficial sin obligarle a subir un kárdex. Al subir el archivo, el mapa pasará a modo de auditoría de calificaciones."),
        ("¿Qué hacer si un alumno ya aprobó una materia pero en el kárdex de Banner aparece en adeudo?",
         "El sistema audita con base en la verdad documental del archivo PDF expedido. Si el alumno acreditó mediante acta fuera de tiempo aún no reflejada en Banner, emita una nueva versión del kárdex oficial."),
        ("¿Por qué no aparecen los requisitos de Ortografía y EGEL?",
         "En cumplimiento de la normativa actual de UNID, dichos cursos fueron retirados de los requisitos de titulación. La validación transversal de egreso se enfoca exclusivamente en los 5 niveles de inglés curricular."),
        ("¿Qué sucede si se interrumpe la conexión a Internet o a Neon Database?",
         "El sistema cuenta con tolerancia total a fallos (Modo de Contingencia Local). Puede seguir auditando kárdex y descargando PDFs sin interrupciones."),
        ("¿Cómo usar el Asistente Académico Inteligente?",
         "Haga clic en el botón flotante dorado 'Asistente UNID' en la esquina inferior derecha. Puede preguntar sobre normativas, o escribir 'abre el kardex de [matrícula]' para consultar un expediente al instante.")
    ]
    for preg, resp in faqs:
        add_bullet("Pregunta: " + preg, resp)
        doc.add_paragraph().paragraph_format.space_after = Pt(3)
        
    add_callout_box(
        doc,
        "Canal de Soporte Institucional",
        "Para solicitudes de incorporación de planes de estudio o incidencias técnicas:\n"
        "• Correo de Soporte: control_academico.devs@hotmail.com / coordinacion.cam@unid.mx\n"
        "• Coordinación Académica UNID Sede Campeche",
        box_type="info"
    )

    doc.add_page_break()

    # =========================================================================
    # CAPÍTULO 9: LIMITANTES DE HOSPEDAJE Y RECOMENDACIONES
    # =========================================================================
    add_heading_1("9. LIMITANTES DE HOSPEDAJE Y RECOMENDACIONES OPERATIVAS")
    
    add_body(
        "La plataforma opera bajo un modelo en la nube ágil y eficiente (Frontend en Vercel Edge y Backend "
        "en Neon Serverless PostgreSQL), lo cual no genera costos de servidores dedicados pero requiere "
        "conocer las siguientes condiciones operativas:"
    )
    add_bullet("Cold Start de Neon (1.5 a 3 seg)", "Si la base de datos lleva más de 5 minutos inactiva, la primera consulta del día experimentará un breve retardo mientras se reactiva la instancia. Luego opera a máxima velocidad.")
    add_bullet("Almacenamiento Estructurado (500 MB)", "Solo se guardan dictámenes en JSON comprimido, nunca archivos PDF pesados. Mantenga la base depurada usando la política de retención de 5 meses.")
    add_bullet("Procesamiento en Memoria RAM Local", "Para no saturar la memoria del navegador, se recomienda procesar kárdex en lotes de 25 a 50 alumnos por vez.")
    add_bullet("Modo Local de Contingencia", "Si no hay conexión a Neon DB, toda la auditoría, mapas y exportación a PDF continúan funcionando al 100% de forma local en el navegador.")

    # Guardar documentos .docx y .doc
    output_docx = "MANUAL_DE_USUARIO_SISTEMA_UNID.docx"
    output_doc = "MANUAL_DE_USUARIO_SISTEMA_UNID.doc"
    doc.save(output_docx)
    shutil.copyfile(output_docx, output_doc)
    
    print(f"Manual generado exitosamente:")
    print(f"1. {os.path.abspath(output_docx)}")
    print(f"2. {os.path.abspath(output_doc)}")

if __name__ == "__main__":
    build_manual()
