// Cálculos con meses en formato "YYYY-MM" (funciones puras y testeadas).

/**
 * Suma (o resta) meses: ("2026-01", -1) -> "2025-12".
 * @param {string} mes "YYYY-MM"
 * @param {number} cantidad
 * @returns {string}
 */
export function sumarMeses(mes, cantidad) {
  const [a, m] = mes.split('-').map(Number);
  const total = a * 12 + (m - 1) + cantidad;
  const anio = Math.floor(total / 12);
  const nuevoMes = (total % 12) + 1;
  return `${anio}-${String(nuevoMes).padStart(2, '0')}`;
}

/**
 * Primer y último día del mes, para consultar los gastos de ese mes.
 * Como las fechas se guardan como "YYYY-MM-DD", se comparan como texto.
 * @param {string} mes "YYYY-MM"
 * @returns {{ desde: string, hasta: string }}
 */
export function rangoDelMes(mes) {
  return { desde: `${mes}-01`, hasta: `${mes}-31` };
}

/**
 * Día de hoy dentro de un mes: si es el mes actual, hoy; si no, el día 1.
 * Sirve para proponer fecha al apuntar un gasto mientras se mira otro mes.
 * @param {string} mes "YYYY-MM"
 * @param {string} hoy "YYYY-MM-DD"
 * @returns {string}
 */
export function fechaPorDefecto(mes, hoy) {
  return hoy.startsWith(mes) ? hoy : `${mes}-01`;
}
