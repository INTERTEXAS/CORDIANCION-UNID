// src/services/pdfParser.js
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { CARRERAS_LOCAL, REQUISITOS_EGRESO } from '../data/carrerasData.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

let dynamicCrses = [];
for (const c of CARRERAS_LOCAL) {
  if (c.mapa_json) {
    for (const cuat of (c.mapa_json.cuatrimestres || [])) {
      for (const mat of (cuat.materias || [])) {
        if (mat.crse) dynamicCrses.push(mat.crse);
      }
    }
    for (const el of (c.mapa_json.electivas_multidisciplinares || [])) {
      if (el.crse) dynamicCrses.push(el.crse);
    }
  }
}
for (const req of REQUISITOS_EGRESO) {
  if (req.crse) dynamicCrses.push(req.crse);
}

dynamicCrses = [...new Set(dynamicCrses)];
const CRSE_REGEX = new RegExp('\\b(' + dynamicCrses.join('|') + '|[A-Z]{2,3}\\d{2}|F00[1-4]|P001|0008|CMS02|CMS03|EG[A-Z0-9]{3}|0001)\\b', 'gi');

export async function parsePdfKardex(fileOrBuffer) {
  const arrayBuffer = fileOrBuffer instanceof File
    ? await fileOrBuffer.arrayBuffer()
    : fileOrBuffer;

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;

  // Comprobar si es un reporte consolidado de grupo / cuatrimestre
  const page1 = await pdf.getPage(1);
  const textContent1 = await page1.getTextContent();
  const page1Text = textContent1.items.map(it => it.str).join(' ');

  if (/Reporte\s+de\s+materias\s+acreditadas/i.test(page1Text)) {
    return await parseBatchGroupPdf(pdf);
  }

  // Leer exclusivamente la Página 1 del PDF para kardex individual
  const page = page1;
  const textContent = textContent1;

  const rawItems = textContent.items
    .filter(it => it.str && it.str.trim() !== '')
    .map(it => {
      const text = it.str
        .replace(/CFTD8/gi, 'CFT08')
        .replace(/MT\s+02/gi, 'MTS02')
        .replace(/MT02/gi, 'MTS02')
        .trim();
      return {
        x: it.transform[4],
        y: it.transform[5],
        text
      };
    })
    .sort((a, b) => b.y - a.y || a.x - b.x);

  // Cortar antes de "Movimientos", "Becas" o "Num."
  let cutoffY = -Infinity;
  for (const it of rawItems) {
    if (/Movimientos|Becas|Beca\s+de\s+Inscripci[oó]n|^Num\.$/i.test(it.text)) {
      cutoffY = it.y;
      break;
    }
  }

  const validItems = cutoffY === -Infinity
    ? rawItems
    : rawItems.filter(it => it.y > cutoffY + 2);

  // Reconstruir renglones visuales por coordenada Y para leer el encabezado del alumno
  const visualRows = [];
  for (const it of validItems) {
    let row = visualRows.find(r => Math.abs(r.y - it.y) <= 4);
    if (!row) {
      row = { y: it.y, items: [] };
      visualRows.push(row);
    }
    row.items.push(it);
  }
  visualRows.sort((a, b) => b.y - a.y);
  visualRows.forEach(r => r.items.sort((a, b) => a.x - b.x));

  const fullText = visualRows
    .map(r => r.items.map(i => i.text).join(' '))
    .join('\n');

  const estudiante = extractStudentMetadata(fullText);

  // Ubicar el encabezado de la tabla de Materias
  const headerRow = visualRows.find(r =>
    r.items.some(i => /\b(?:CRN|SUBJ|CRSE|PERIODO)\b/i.test(i.text))
  );
  const tableTopY = headerRow ? headerRow.y - 2 : 730;
  const tableItems = validItems.filter(it => it.y < tableTopY);

  // 1. Extraer todas las claves CRSE en orden vertical (de arriba hacia abajo)
  const crseList = [];
  for (const it of tableItems) {
    if (it.x > 230) continue;
    const matches = [...it.text.matchAll(CRSE_REGEX)];
    for (let i = 0; i < matches.length; i++) {
      crseList.push({
        crse: matches[i][1].toUpperCase(),
        x: it.x,
        y: it.y - (i * 2.5)
      });
    }
  }
  crseList.sort((a, b) => b.y - a.y);

  // 2. Extraer todos los CRNs (5 dígitos) y Periodos (202xxx) en orden vertical
  const crnList = [];
  const periodList = [];
  for (const it of tableItems) {
    if (it.x < 95) {
      const cMatches = [...it.text.matchAll(/\b(\d{5})\b/g)];
      for (let i = 0; i < cMatches.length; i++) {
        crnList.push({ crn: cMatches[i][1], y: it.y - (i * 2.5) });
      }
    }
    if (it.x >= 95 && it.x <= 260) {
      const pMatches = [...it.text.matchAll(/\b(202\d{3})\b/g)];
      for (let i = 0; i < pMatches.length; i++) {
        periodList.push({ periodo: pMatches[i][1], y: it.y - (i * 2.5) });
      }
    }
  }
  crnList.sort((a, b) => b.y - a.y);
  periodList.sort((a, b) => b.y - a.y);

  // 3. Extraer cada marcador de MODO (RW / RE) en la derecha
  const modoList = [];
  for (const it of tableItems) {
    if (it.x < 340) continue;
    const mMatches = [...it.text.matchAll(/\b(RW|RE)\b/gi)];
    for (let i = 0; i < mMatches.length; i++) {
      modoList.push({
        modo: mMatches[i][1].toUpperCase(),
        x: it.x,
        y: it.y - (i * 2.5),
        origY: it.y,
        itemRef: it,
        subIndex: i,
        totalInItem: mMatches.length
      });
    }
  }
  modoList.sort((a, b) => b.y - a.y);

  // 4. Obtener la calificación final (GRDE) de cada materia evitando confundir PF con GRDE
  for (let mIdx = 0; mIdx < modoList.length; mIdx++) {
    const mObj = modoList[mIdx];
    const targetY = (crseList.length === modoList.length && crseList[mIdx])
      ? (mObj.y + crseList[mIdx].y) / 2
      : mObj.y;

    // Delimitar la franja vertical exclusiva de esta fila usando los puntos medios hacia arriba y abajo
    const prevY = mIdx > 0 ? modoList[mIdx - 1].y : targetY + 14;
    const nextY = mIdx < modoList.length - 1 ? modoList[mIdx + 1].y : targetY - 14;

    const yTopLimit = Math.min(mObj.origY + 6.5, (prevY + targetY) / 2 + 2);
    const yBottomLimit = Math.max(mObj.origY - 9.5, (targetY + nextY) / 2 - 2);

    let finalGrade = null;

    // A) Revisar si el propio item que contiene RW/RE trae la calificación pegada (ej. "10 RW", "RW 9", "RW B")
    const itemText = mObj.itemRef.text;
    if (mObj.totalInItem === 1) {
      const rwPos = itemText.search(/\b(RW|RE)\b/i);
      const afterRw = itemText.substring(rwPos + 2).trim();
      const beforeRw = itemText.substring(0, rwPos).trim();

      if (afterRw) {
        const afterTokens = afterRw.split(/\s+/);
        for (const t of afterTokens) {
          const g = cleanGradeToken(t);
          if (g) {
            finalGrade = g;
            break;
          }
        }
      }
      if (!finalGrade && beforeRw) {
        const beforeTokens = beforeRw.split(/\s+/);
        for (let k = beforeTokens.length - 1; k >= 0; k--) {
          const g = cleanGradeToken(beforeTokens[k]);
          if (g) {
            finalGrade = g;
            break;
          }
        }
      }
    }

    // B) Buscar en los items de calificación de esa franja
    // Si dos números están en distinta columna (dx > 14), GRDE es el de más a la derecha (mayor X).
    // Si están apilados en la misma columna PF/GRDE (dx <= 14), GRDE es el de abajo (menor Y).
    if (!finalGrade) {
      const rowGradeItems = tableItems
        .filter(other =>
          other !== mObj.itemRef &&
          other.x >= 335 &&
          other.x <= mObj.x + 35 &&
          other.y <= yTopLimit &&
          other.y >= yBottomLimit
        )
        .sort((a, b) => (Math.abs(a.x - b.x) > 14 ? a.x - b.x : b.y - a.y));

      const extractedRowGrades = [];
      for (const gi of rowGradeItems) {
        const cleanedText = gi.text.replace(/\bCAM\s+[015]\b/gi, ' ');
        const tokens = cleanedText.split(/\s+/);
        for (const tok of tokens) {
          const g = cleanGradeToken(tok);
          if (g) {
            extractedRowGrades.push({ grade: g, x: gi.x, y: gi.y });
          }
        }
      }

      if (extractedRowGrades.length > 0) {
        finalGrade = extractedRowGrades[extractedRowGrades.length - 1].grade;
      }
    }

    mObj.calificacion = finalGrade || '';
  }

  // 5. Construir los registros finales
  const usedModos = new Set();
  const registros = crseList.map((cItem, idx) => {
    const crse = cItem.crse;
    const subj = getSubjFromCatalog(crse);

    let periodo = '202420';
    if (periodList.length === crseList.length && periodList[idx]) {
      periodo = periodList[idx].periodo;
    } else if (periodList.length > 0) {
      let bestP = periodList[0];
      let minPDiff = Math.abs(bestP.y - cItem.y);
      for (const p of periodList) {
        const d = Math.abs(p.y - cItem.y);
        if (d < minPDiff) {
          minPDiff = d;
          bestP = p;
        }
      }
      periodo = bestP.periodo;
    }

    let crn = '00000';
    if (crnList.length === crseList.length && crnList[idx]) {
      crn = crnList[idx].crn;
    } else if (crnList.length > 0) {
      let bestC = null;
      let minCDiff = Infinity;
      for (const c of crnList) {
        const d = Math.abs(c.y - cItem.y);
        if (d < minCDiff && d <= 25) {
          minCDiff = d;
          bestC = c;
        }
      }
      if (bestC) crn = bestC.crn;
    }

    let matchedModo = null;
    if (modoList.length === crseList.length && modoList[idx]) {
      matchedModo = modoList[idx];
    } else {
      let bestMIdx = -1;
      let minMDiff = Infinity;
      for (let mIdx = 0; mIdx < modoList.length; mIdx++) {
        if (usedModos.has(mIdx)) continue;
        const d = Math.abs(modoList[mIdx].y - cItem.y);
        if (d < minMDiff && d <= 28) {
          minMDiff = d;
          bestMIdx = mIdx;
        }
      }
      if (bestMIdx !== -1) {
        usedModos.add(bestMIdx);
        matchedModo = modoList[bestMIdx];
      }
    }

    const calificacion = matchedModo ? matchedModo.calificacion : '';
    const modalidad = matchedModo ? matchedModo.modo : 'RW';

    return {
      periodo,
      crn,
      subj,
      crse,
      claveCompleta: subj + '-' + crse,
      modalidad,
      calificacion,
      esAprobada: isGradePassing(calificacion),
      esReprobada: isGradeFailing(calificacion),
      estaCursando: !calificacion || calificacion === ''
    };
  });

  detectarModalidad(estudiante, registros);

  return {
    isBatch: false,
    rawText: fullText,
    estudiante,
    registros,
    totalPaginas: 1
  };
}

function cleanGradeToken(raw) {
  if (!raw) return null;
  const s = raw.trim().replace(/[|]/g, '');
  if (!s || /^CAM/i.test(s) || /^(?:RW|RE)$/i.test(s)) return null;

  if (s === '19' || s === '109' || s === '199') return '9';
  if (s === '18' || s === '189') return '8';
  if (s === '17' || s === '107') return '7';
  if (s.toLowerCase() === 'g') return '9';
  if (s === 'B') return '8';

  if (s === '10' || s === '10.0') return '10';
  if (/^[5-9]$/.test(s)) return s;
  if (/^(?:AC|NP|NA)$/i.test(s)) return s.toUpperCase();

  return null;
}

function extractStudentMetadata(text) {
  let matricula = '00000000';
  let nombre = 'ALUMNO UNID';
  let sede = 'CAM';
  let programa = 'LIC-COFI-18';
  let estatus = 'AC';

  const matMatch = text.match(/\b(00\d{6}|\d{8})\b/);
  if (matMatch) {
    matricula = matMatch[1];
    const afterMat = text.substring(text.indexOf(matricula) + matricula.length);
    const camMatch = afterMat.match(/([\s\S]{1,120}?)\b(CAM)\b/i);
    if (camMatch) {
      const candidate = camMatch[1]
        .replace(/\*/g, ' ')
        .replace(/[|:\-–—]/g, ' ')
        .replace(/\b(?:ID|Nombre|Sede|Prog|Estatus|Promocion|Datos|Personales)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (candidate.length > 2) {
        nombre = candidate;
      }
      sede = camMatch[2].toUpperCase();
    }
  }

  const progMatch = text.match(/\((LIC-[A-Z0-9-]+)\)/i) || text.match(/\b(LIC-[A-Z0-9-]+)\b/i);
  if (progMatch) programa = progMatch[1].toUpperCase();

  const estMatch = text.match(/\)\s*[^\n|]*\|?\s*\b(EG|AC|BA|IN)\b/i) || text.match(/\b(EG|AC|BA|IN)\b/);
  if (estMatch) estatus = estMatch[1].toUpperCase();

  return { matricula, nombre, programa, sede, estatus };
}

function getSubjFromCatalog(crse) {
  const req = REQUISITOS_EGRESO.find(r => r.crse === crse);
  if (req) return req.subj;

  for (const carrera of CARRERAS_LOCAL) {
    if (!carrera.mapa_json) continue;
    const { cuatrimestres = [], electivas_multidisciplinares = [] } = carrera.mapa_json;
    for (const c of cuatrimestres) {
      for (const m of (c.materias || [])) {
        const mCrse = m.crse || (m.clave ? m.clave.split('-')[1] : '');
        const mSubj = m.subj || (m.clave ? m.clave.split('-')[0] : '');
        if (mCrse === crse) return mSubj;
      }
    }
    for (const el of electivas_multidisciplinares) {
      const elCrse = el.crse || (el.clave ? el.clave.split('-')[1] : '');
      const elSubj = el.subj || (el.clave ? el.clave.split('-')[0] : '');
      if (elCrse === crse) return elSubj;
    }
  }

  if (['F001', 'F002', 'F003', 'F004', 'P001'].includes(crse)) return 'INHH';
  if (crse === '0008') return 'LENG';
  return 'LMAX';
}

function isGradePassing(calif) {
  if (!calif) return false;
  const s = String(calif).trim().toUpperCase();
  if (s === 'AC') return true;
  const num = parseFloat(s);
  return !isNaN(num) && num >= 6;
}

function isGradeFailing(calif) {
  if (!calif) return false;
  const s = String(calif).trim().toUpperCase();
  if (s === 'NP' || s === 'NA') return true;
  const num = parseFloat(s);
  return !isNaN(num) && num < 6;
}

/**
 * Procesa reportes consolidados oficiales ("Reporte de materias acreditadas")
 * que contienen múltiples alumnos en 1, 5, 30 o 100+ páginas de forma totalmente dinámica.
 */
export async function parseBatchGroupPdf(pdf) {
  const students = [];
  let currentStudent = null;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const tc = await page.getTextContent();

    const items = tc.items
      .map(it => ({
        str: it.str.trim(),
        x: Math.round(it.transform[4]),
        y: Math.round(it.transform[5])
      }))
      .filter(it => it.str.length > 0);

    const rows = [];
    for (const it of items) {
      let r = rows.find(row => Math.abs(row.y - it.y) <= 4);
      if (!r) {
        r = { y: it.y, items: [] };
        rows.push(r);
      }
      r.items.push(it);
    }
    rows.sort((a, b) => b.y - a.y);
    rows.forEach(r => r.items.sort((a, b) => a.x - b.x));

    for (const row of rows) {
      const rowText = row.items.map(it => it.str).join(' ');
      if (/Reporte\s+de\s+materias|Expediente.*Nombre|Subj.*Crse/i.test(rowText)) continue;

      // Un alumno nuevo comienza cuando hay un expediente de 8 dígitos en x < 70
      const expItem = row.items.find(it => it.x < 70 && /^\d{8}$/.test(it.str));
      if (expItem) {
        const nameItems = row.items.filter(it => it.x >= 70 && it.x < 215);
        const name = nameItems.map(it => it.str).join(' ').trim();

        currentStudent = {
          matricula: expItem.str,
          nombre: name || `Estudiante ${expItem.str}`,
          programa: '',
          sede: 'CAM',
          estatus: 'EG',
          registros: []
        };
        students.push(currentStudent);
      }

      if (!currentStudent) continue;

      const periodoItem = row.items.find(it => it.x >= 200 && it.x < 255 && /^\d{6}$/.test(it.str));
      const progItem = row.items.find(it => it.x >= 250 && it.x < 315 && /^LIC-[A-Z0-9-]+$/i.test(it.str));
      const subjItem = row.items.find(it => it.x >= 310 && it.x < 365 && /^[A-Z]{3,4}$/i.test(it.str));
      const crseItem = row.items.find(it => it.x >= 360 && it.x < 425 && /^[A-Z0-9-]{3,6}$/i.test(it.str));
      const califItem = row.items.find(it => it.x >= 505 && /^(\d{1,2}|AC|NP|NA|VS)$/i.test(it.str));

      if (progItem && !currentStudent.programa) {
        currentStudent.programa = progItem.str.toUpperCase();
      }

      if (periodoItem && crseItem && califItem) {
        const califStr = califItem.str.trim().toUpperCase();
        const resolvedSubj = subjItem ? subjItem.str.toUpperCase() : getSubjFromCatalog(crseItem.str.toUpperCase());
        const crseClean = crseItem.str.toUpperCase();

        currentStudent.registros.push({
          periodo: periodoItem.str,
          crn: '00000',
          subj: resolvedSubj,
          crse: crseClean,
          claveCompleta: `${resolvedSubj}-${crseClean}`,
          modalidad: 'RW',
          calificacion: califStr,
          esAprobada: isGradePassing(califStr),
          esReprobada: isGradeFailing(califStr),
          estaCursando: !califStr
        });
      }
    }
  }

  for (const student of students) {
    detectarModalidad(student, student.registros);
  }

  return {
    isBatch: true,
    totalAlumnos: students.length,
    students
  };
}

export function detectarModalidad(estudiante, registros) {
  let conteoEjecutivo = 0;
  let conteoEscolarizado = 0;
  
  const dualClaves = ['ADS38', 'ADS39', 'ADS40', 'MKT26', 'MKS28', 'EES11', 'EES12'];
  let tieneDual = false;

  for (const r of registros) {
    const subj = r.subj || '';
    const crse = r.crse || '';
    
    if (subj.startsWith('E') || /^[A-Z]{2}R\d{2}$/.test(crse)) {
      conteoEjecutivo++;
    } else if (subj.startsWith('L') || /^[A-Z]{2}[ST]\d{2}$/.test(crse)) {
      conteoEscolarizado++;
    }
    
    if (dualClaves.includes(crse)) {
      tieneDual = true;
    }
  }

  if (conteoEjecutivo > conteoEscolarizado || estudiante.programa === 'LIC-EJCO-17') {
    estudiante.modalidadDetectada = 'EJECUTIVO';
    estudiante.programa = 'LIC-EJCO-17';
  } else if (conteoEscolarizado >= conteoEjecutivo && tieneDual) {
    estudiante.modalidadDetectada = 'ESCOLARIZADO DUAL';
    estudiante.programa = 'LIC-DAEM-18';
  } else {
    estudiante.modalidadDetectada = 'ESCOLARIZADO';
    estudiante.programa = 'LIC-COFI-18';
  }
  
  return estudiante;
}