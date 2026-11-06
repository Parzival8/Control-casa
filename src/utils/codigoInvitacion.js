// Códigos de invitación a un hogar: 8 caracteres fáciles de dictar y copiar.
// Sin caracteres ambiguos: no hay 0/O ni 1/I (ESPECIFICACION.md, sección 3).
// El formato debe coincidir con esCodigo() de firestore.rules.

export const ALFABETO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const LONGITUD_CODIGO = 8;
export const DIAS_VALIDEZ_CODIGO = 7;

/**
 * Genera un código aleatorio.
 * @param {() => number} [aleatorio] Devuelve un número en [0, 1). Se puede
 *   sustituir en los tests para obtener siempre el mismo código.
 * @returns {string} Por ejemplo "K7MP2XQA".
 */
export function generarCodigo(aleatorio = Math.random) {
  let codigo = '';
  for (let i = 0; i < LONGITUD_CODIGO; i++) {
    codigo += ALFABETO_CODIGO[Math.floor(aleatorio() * ALFABETO_CODIGO.length)];
  }
  return codigo;
}

/**
 * Limpia lo que escribe el usuario: mayúsculas, sin espacios ni guiones.
 * @param {string} texto
 * @returns {string}
 */
export function normalizarCodigo(texto) {
  return String(texto ?? '')
    .toUpperCase()
    .replace(/[\s-]/g, '');
}

/**
 * ¿Tiene el formato de un código? (No comprueba que exista.)
 * @param {string} codigo Ya normalizado.
 * @returns {boolean}
 */
export function esFormatoCodigoValido(codigo) {
  if (typeof codigo !== 'string' || codigo.length !== LONGITUD_CODIGO) return false;
  return [...codigo].every((c) => ALFABETO_CODIGO.includes(c));
}

/**
 * Fecha de caducidad de un código creado ahora.
 * @param {Date} [ahora]
 * @returns {Date}
 */
export function fechaCaducidadCodigo(ahora = new Date()) {
  return new Date(ahora.getTime() + DIAS_VALIDEZ_CODIGO * 24 * 60 * 60 * 1000);
}
