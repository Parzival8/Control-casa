// Decisiones sobre la gestión del hogar (funciones puras).

/**
 * Miembro al que se propone dejar el hogar cuando el creador se va: el más
 * antiguo de los demás (el orden de `miembros` es el de llegada).
 * @param {{ miembros: string[] }} hogar
 * @param {string} uid  Quien se va.
 * @returns {string|null} null si no queda nadie más.
 */
export function sucesorPropuesto(hogar, uid) {
  return hogar.miembros.find((m) => m !== uid) ?? null;
}

/**
 * Qué pasa con el hogar si `uid` se va (sale o elimina su cuenta).
 * @param {{ miembros: string[], creadoPor: string }} hogar
 * @param {string} uid
 * @returns {'salir'|'traspasar'|'borrar'}
 *   salir: es un miembro normal; traspasar: es el creador y quedan otros;
 *   borrar: es el creador y está solo (el hogar se borra).
 */
export function consecuenciaDeIrse(hogar, uid) {
  if (hogar.creadoPor !== uid) return 'salir';
  return hogar.miembros.some((m) => m !== uid) ? 'traspasar' : 'borrar';
}

/**
 * Añade un hogar a la lista de anteriores sin repetir y con un máximo.
 * @param {string[]|undefined} anteriores
 * @param {string} hogarId
 * @returns {string[]}
 */
export function anadirHogarAnterior(anteriores, hogarId) {
  const lista = (anteriores ?? []).filter((id) => id !== hogarId);
  return [...lista, hogarId].slice(-50);
}
