// Cálculos con gastos (funciones puras y testeadas). Importes en céntimos.

/**
 * @typedef {Object} Gasto
 * @property {string} id
 * @property {number} importe        Céntimos, entero > 0.
 * @property {string} categoriaId
 * @property {string} fecha          "YYYY-MM-DD".
 * @property {string} nota
 * @property {string|null} pagadoPor uid del miembro que pagó, o null (sin indicar).
 * @property {string} creadoPor
 * @property {string} editadoPor
 * @property {string|null} recurrenteId
 * @property {Date|null} creadoEn    null mientras no lo confirma el servidor.
 */

/**
 * Suma de importes en céntimos.
 * @param {Gasto[]} gastos
 * @returns {number}
 */
export function totalCentimos(gastos) {
  return gastos.reduce((suma, g) => suma + g.importe, 0);
}

/**
 * Más recientes primero: por fecha y, el mismo día, por hora de creación.
 * Los que aún no tienen hora (recién apuntados sin conexión) van primero.
 * @param {Gasto[]} gastos
 * @returns {Gasto[]} Copia ordenada.
 */
export function ordenarGastos(gastos) {
  const momento = (g) => (g.creadoEn ? g.creadoEn.getTime() : Number.MAX_SAFE_INTEGER);
  return [...gastos].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return momento(b) - momento(a);
  });
}

/**
 * Inicial para el avatar de un miembro ("ana" -> "A").
 * @param {string} nombre
 * @returns {string}
 */
export function inicial(nombre) {
  const limpio = String(nombre ?? '').trim();
  return limpio ? limpio[0].toLocaleUpperCase('es-ES') : '?';
}

/** Colores de avatar: el mismo miembro tiene siempre el mismo color. */
const COLORES_AVATAR = ['#2563eb', '#db2777', '#16a34a', '#ea580c', '#7c3aed', '#0891b2'];

/**
 * @param {string} uid
 * @returns {string} Color hexadecimal.
 */
export function colorAvatar(uid) {
  let suma = 0;
  for (const c of String(uid)) suma = (suma * 31 + c.charCodeAt(0)) % 1000003;
  return COLORES_AVATAR[suma % COLORES_AVATAR.length];
}

/**
 * Comprueba los datos de un gasto antes de guardarlo.
 * @param {{ importe: number|null, categoriaId: string|null, fecha: string, nota: string }} datos
 * @returns {string|null} Mensaje de error en español o null si está bien.
 */
export function validarGasto({ importe, categoriaId, fecha, nota }) {
  if (!Number.isInteger(importe) || importe <= 0) return 'Escribe un importe mayor que cero.';
  if (importe > 100000000) return 'El importe es demasiado alto.';
  if (!categoriaId) return 'Elige una categoría.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return 'La fecha no es válida.';
  if ((nota ?? '').length > 200) return 'La nota no puede tener más de 200 caracteres.';
  return null;
}
