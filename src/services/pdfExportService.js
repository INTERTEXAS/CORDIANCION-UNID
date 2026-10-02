// Servicio de Exportación Oficial de Dictamen en PDF (2 Hojas Horizontales / Landscape)
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Genera y descarga el reporte institucional de 2 páginas en formato horizontal (A4 landscape)
 * preservando estrictamente la relación de aspecto para evitar que el texto se aplaste o distorsione.
 * 
 * @param {HTMLElement} elementHoja1 Referencia al DOM de la Hoja 1 (Mapa de Ejecución)
 * @param {HTMLElement} elementHoja2 Referencia al DOM de la Hoja 2 (Cédula de Auditoría)
 * @param {string} matricula Matrícula del estudiante para el nombre del archivo
 */
export async function exportarDictamenPdf(elementHoja1, elementHoja2, matricula = '00000000') {
  if (!elementHoja1 || !elementHoja2) {
    throw new Error('No se encontraron las referencias de las hojas para exportar.');
  }

  // 0. Esperar a que las fuentes institucionales estén 100% listas
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  // Opciones optimizadas de captura en alta resolución con escala 2.5 y windowWidth de 1440
  const canvasOptions = {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1440,
    width: 1440,
    onclone: (clonedDoc) => {
      const wrapper = clonedDoc.getElementById('export-pdf-wrapper');
      if (wrapper) {
        wrapper.style.opacity = '1';
        wrapper.style.zIndex = '1';
        wrapper.style.position = 'static';
        wrapper.style.display = 'block';
        wrapper.style.width = '1440px';
        wrapper.style.maxWidth = '1440px';
        wrapper.style.boxSizing = 'border-box';
      }

      // Inyectar hoja de estilos estricta para garantizar simetría total de márgenes
      const styleEl = clonedDoc.createElement('style');
      styleEl.innerHTML = `
        *, *::before, *::after {
          box-sizing: border-box !important;
        }
        #export-pdf-wrapper {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 1440px !important;
          max-width: 1440px !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #export-hoja1-container, #export-hoja2-container {
          width: 1440px !important;
          max-width: 1440px !important;
          box-sizing: border-box !important;
          padding: 24px 32px !important;
          margin: 0 auto !important;
          overflow: hidden !important;
          background-color: #ffffff !important;
        }
        #hoja1-mapa-ejecucion, #hoja2-cedula-auditoria {
          width: 100% !important;
          max-width: 1376px !important;
          box-sizing: border-box !important;
          margin: 0 auto !important;
        }
        #export-hoja1-container span, #export-hoja1-container p,
        #export-hoja2-container span, #export-hoja2-container p {
          line-height: 1.35 !important;
        }
        /* Centrado óptico exacto para pastillas y badges sin sesgo hacia abajo */
        #export-hoja1-container [data-badge="true"], #export-hoja2-container [data-badge="true"],
        #export-hoja1-container .badge-pill, #export-hoja2-container .badge-pill {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 22px !important;
          min-height: 22px !important;
          line-height: 1 !important;
          vertical-align: middle !important;
          padding: 0 12px !important;
          box-sizing: border-box !important;
        }
        #export-hoja1-container [data-badge="true"] > span, #export-hoja2-container [data-badge="true"] > span,
        #export-hoja1-container .badge-pill > span, #export-hoja2-container .badge-pill > span {
          display: inline-block !important;
          line-height: 1 !important;
          transform: translateY(-1.2px) !important;
        }
        #export-hoja1-container span.truncate, #export-hoja2-container span.truncate,
        #export-hoja1-container span[class*="truncate"], #export-hoja2-container span[class*="truncate"],
        #export-hoja1-container span[class*="text-ellipsis"], #export-hoja2-container span[class*="text-ellipsis"] {
          overflow: visible !important;
          text-overflow: clip !important;
        }
      `;
      clonedDoc.head.appendChild(styleEl);
    }
  };

  try {
    // 1. Capturar Hoja 1 (Mapa de Ejecución Oficial)
    const canvas1 = await html2canvas(elementHoja1, canvasOptions);
    const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);

    // 2. Capturar Hoja 2 (Cédula de Auditoría y Trazabilidad)
    const canvas2 = await html2canvas(elementHoja2, canvasOptions);
    const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);

    // 3. Crear documento PDF de 2 hojas en orientación horizontal (A4: 297mm x 210mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 8; // Margen limpio de 8mm por los 4 lados para garantizar holgura total
    const printableWidth = pageWidth - (margin * 2);
    const printableHeight = pageHeight - (margin * 2);

    // Función auxiliar para renderizar con preservación 1:1 de aspecto dejando 8mm de margen limpio y centrado
    const renderProportionalPage = (canvas, imgData, isFirstPage = false) => {
      if (!isFirstPage) {
        pdf.addPage('a4', 'landscape');
      }

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calcular escala proporcional dejando margen limpio de 8mm por los 4 lados
      const scale = Math.min(printableWidth / imgWidth, printableHeight / imgHeight);
      const renderW = imgWidth * scale;
      const renderH = imgHeight * scale;

      // Centrado perfecto dentro del área de la hoja con margen garantizado
      const posX = margin + (printableWidth - renderW) / 2;
      const posY = margin + (printableHeight - renderH) / 2;

      pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
    };

    // Agregar Hoja 1 y Hoja 2 con aspecto geométrico exacto
    renderProportionalPage(canvas1, imgData1, true);
    renderProportionalPage(canvas2, imgData2, false);

    // 4. Descargar archivo con nomenclatura formal
    const cleanMatricula = matricula.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `Dictamen_Auditoria_UNID_${cleanMatricula || 'ALUMNO'}.pdf`;
    pdf.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('[PdfExportService] Error al generar el PDF de 2 hojas:', error);
    throw error;
  }
}
