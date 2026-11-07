// Gastos fijos (recurrentes): cuándo toca apuntarlos (funciones puras).

/**
 * @typedef {Object} Recurrente
 * @property {string} id
 * @property {number} importe               Céntimos.
 * @property {string} categoriaId
 * @property {number} diaDelMes             1-28 (para que exista en todos los meses).
 * @property {string} nota
 * @property {string|null} pagadoPor        uid o null.
 * @property {boolean} activo
 * @property {string|null} ultimoMesGenerado "YYYY-MM" del último mes ya apuntado.
 */

/**
 * Id determinista del gasto que genera un fijo en un mes: así, aunque dos
 * miembros abran la app a la vez, los dos intentan crear EL MISMO documento
 * y solo puede existir uno.
 * @param {string} recurrenteId
 * @param {string} mes "YYYY-MM"
 * @returns {string}
 */
export function idGastoFijo(recurrenteId, mes) {
  return `${recurrenteId}_${mes}`;
}

/**
 * Fecha del gasto generado: el día elegido del mes.
 * @param {string} mes "YYYY-MM"
 * @param {number} dia 1-28
 * @returns {string} "YYYY-MM-DD"
 */
export function fechaGastoFijo(mes, dia) {
  return `${mes}-${String(dia).padStart(2, '0')}`;
}

/**
 * ¿Hay que apuntar hoy este gasto fijo?
 * Sí si está activo, ya ha llegado su día este mes y aún no se ha apuntado
 * este mes. Los meses pasados que nadie abrió la app no se recuperan.
 * @param {Recurrente} recurrente
 * @param {string} hoy "YYYY-MM-DD"
 * @returns {boolean}
 */
export function tocaGenerar(recurrente, hoy) {
  const mes = hoy.slice(0, 7);
  const diaHoy = Number(hoy.slice(8, 10));
  if (!recurrente.activo) return false;
  if (diaHoy < recurrente.diaDelMes) return false;
  return !recurrente.ultimoMesGenerado || recurrente.ultimoMesGenerado < mes;
}

/**
 * Valida el formulario de un gasto fijo.
 * @param {{ importe: number|null, categoriaId: string|null, diaDelMes: number, nota: string }} datos
 * @returns {string|null}
 */
export function validarRecurrente({ importe, categoriaId, diaDelMes, nota }) {
  if (!Number.isInteger(importe) || importe <= 0) return 'Escribe un importe mayor que cero.';
  if (importe > 100000000) return 'El importe es demasiado alto.';
  if (!categoriaId) return 'Elige una categoría.';
  if (!Number.isInteger(diaDelMes) || diaDelMes < 1 || diaDelMes > 28) {
    return 'El día debe estar entre 1 y 28.';
  }
  if ((nota ?? '').length > 200) return 'La nota no puede tener más de 200 caracteres.';
  return null;
}

/**
 * Al editar un gasto generado por un fijo: si se cambia a otro mes, deja de
 * estar ligado al fijo (su id ya no corresponde a ese mes y las reglas lo
 * rechazarían).
 * @param {string} gastoId
 * @param {string|null} recurrenteId
 * @param {string} fecha "YYYY-MM-DD" nueva.
 * @returns {string|null}
 */
export function recurrenteIdTrasEditar(gastoId, recurrenteId, fecha) {
  if (!recurrenteId) return null;
  return gastoId === idGastoFijo(recurrenteId, fecha.slice(0, 7)) ? recurrenteId : null;
}
