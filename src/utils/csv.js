// Exportación a CSV compatible con Excel en español: separador ";", decimales
// con coma y UTF-8 con BOM (sin el BOM, Excel muestra mal las tildes).

import { centimosATexto, formatearFecha } from './formato';

export const BOM = '﻿';
const SEPARADOR = ';';
const FIN_DE_LINEA = '\r\n';

/**
 * Prepara un valor para el CSV: si lleva ";", comillas o saltos de línea, va
 * entre comillas y las comillas internas se duplican.
 * @param {string|number|null|undefined} valor
 * @returns {string}
 */
export function campoCSV(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  // Evita que Excel interprete el texto como una fórmula (=, +, -, @).
  const seguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return /[;"\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

/**
 * Genera el CSV de unos gastos (de más antiguo a más reciente).
 * @param {import('./gastos').Gasto[]} gastos
 * @param {{ nombreCategoria: (id: string) => string, nombreMiembro: (uid: string) => string }} nombres
 * @returns {string} Texto completo, con BOM.
 */
export function generarCSV(gastos, { nombreCategoria, nombreMiembro }) {
  const cabecera = ['Fecha', 'Categoría', 'Nota', 'Importe (€)', 'Pagado por', 'Apuntado por'];
  const ordenados = [...gastos].sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
  const filas = ordenados.map((g) => [
    formatearFecha(g.fecha),
    nombreCategoria(g.categoriaId),
    g.nota,
    centimosATexto(g.importe),
    g.pagadoPor ? nombreMiembro(g.pagadoPor) : 'Sin indicar',
    nombreMiembro(g.creadoPor),
  ]);
  return (
    BOM + [cabecera, ...filas].map((fila) => fila.map(campoCSV).join(SEPARADOR)).join(FIN_DE_LINEA) + FIN_DE_LINEA
  );
}

/**
 * Nombre del archivo: "control-casa_casa_2026-11.csv" o "..._todo.csv".
 * @param {string} nombreHogar
 * @param {string|null} mes "YYYY-MM" o null para todo el hogar.
 * @returns {string}
 */
export function nombreArchivoCSV(nombreHogar, mes) {
  const limpio =
    String(nombreHogar)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'hogar';
  return `control-casa_${limpio}_${mes ?? 'todo'}.csv`;
}
