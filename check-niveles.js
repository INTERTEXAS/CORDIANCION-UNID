import { CARRERAS_LOCAL } from './src/data/carrerasData.js';
for (const c of CARRERAS_LOCAL) {
  console.log(c.codigo, c.mapa_json?.niveles_ingles, Array.isArray(c.mapa_json?.niveles_ingles));
}
