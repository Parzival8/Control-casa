// Cálculos para la pestaña Estadísticas (funciones puras). Importes en céntimos.

import { sumarMeses } from './meses';

/**
 * Los `cantidad` meses que terminan en `ultimo`, del más antiguo al más reciente.
 * @param {string} ultimo "YYYY-MM"
 * @param {number} [cantidad]
 * @returns {string[]}
 */
export function ultimosMeses(ultimo, cantidad = 12) {
  return Array.from({ length: cantidad }, (_, i) => sumarMeses(ultimo, i - (cantidad - 1)));
}

/**
 * Total de cada mes (los meses sin gastos valen 0).
 * @param {import('./gastos').Gasto[]} gastos
 * @param {string[]} meses "YYYY-MM"
 * @returns {{ mes: string, total: number }[]}
 */
export function totalesPorMes(gastos, meses) {
  const totales = new Map(meses.map((m) => [m, 0]));
  for (const g of gastos) {
    const mes = g.fecha.slice(0, 7);
    if (totales.has(mes)) totales.set(mes, totales.get(mes) + g.importe);
  }
  return meses.map((mes) => ({ mes, total: totales.get(mes) }));
}

/**
 * Diferencia con el mes anterior.
 * @param {number} actual
 * @param {number} anterior
 * @returns {{ diferencia: number, porcentaje: number|null }}
 *   porcentaje null si el mes anterior fue 0 (no se puede calcular).
 */
export function compararConAnterior(actual, anterior) {
  const diferencia = actual - anterior;
  return {
    diferencia,
    porcentaje: anterior === 0 ? null : Math.round((diferencia / anterior) * 1000) / 10,
  };
}

/**
 * Gasto medio mensual: media de los meses que tienen algún gasto (para que
 * los meses anteriores a empezar a usar la app no bajen la media).
 * @param {{ total: number }[]} totales
 * @returns {number} Céntimos (redondeado al céntimo).
 */
export function mediaMensual(totales) {
  const conGasto = totales.filter((t) => t.total > 0);
  if (conGasto.length === 0) return 0;
  return Math.round(conGasto.reduce((s, t) => s + t.total, 0) / conGasto.length);
}

/**
 * Etiqueta corta de un mes para el eje del gráfico: "2026-11" -> "nov".
 * @param {string} mes
 * @returns {string}
 */
export function mesCorto(mes) {
  const nombres = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return nombres[Number(mes.slice(5, 7)) - 1];
}
