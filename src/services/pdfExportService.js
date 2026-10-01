// Servicio de Exportación Oficial de Dictamen en PDF (2 Hojas Horizontales / Landscape)
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Genera y descarga el reporte institucional de 2 páginas en formato horizontal (A4 landscape)
 * @param {HTMLElement} elementHoja1 Referencia al DOM de la Hoja 1 (Mapa de Ejecución)
 * @param {HTMLElement} elementHoja2 Referencia al DOM de la Hoja 2 (Cédula de Auditoría)
 * @param {string} matricula Matrícula del estudiante para el nombre del archivo
 */
export async function exportarDictamenPdf(elementHoja1, elementHoja2, matricula = '00000000') {
  if (!elementHoja1 || !elementHoja2) {
    throw new Error('No se encontraron las referencias de las hojas para exportar.');
  }

  // Opciones optimizadas de captura en alta resolución (escala 2x para nitidez tipográfica)
  const canvasOptions = {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF',
    windowWidth: 1200,
    windowHeight: 850
  };

  try {
    // 1. Capturar Hoja 1 (Mapa de Ejecución Oficial)
    const canvas1 = await html2canvas(elementHoja1, canvasOptions);
    const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);

    // 2. Capturar Hoja 2 (Cédula de Auditoría y Trazabilidad)
    const canvas2 = await html2canvas(elementHoja2, canvasOptions);
    const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);

    // 3. Crear documento PDF de 2 hojas en orientación horizontal (A4: 297mm x 210mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Agregar Hoja 1
    pdf.addImage(imgData1, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');

    // Agregar Hoja 2
    pdf.addPage('a4', 'landscape');
    pdf.addImage(imgData2, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');

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
