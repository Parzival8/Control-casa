// Validaciones de los formularios. Devuelven un mensaje en español o null si
// todo está bien. Firebase vuelve a validar en el servidor.

export const LONGITUD_MINIMA_CONTRASENA = 6;

/**
 * @param {string} email
 * @returns {boolean}
 */
export function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim());
}

/**
 * Valida un nombre (de persona o de hogar).
 * @param {string} nombre
 * @param {number} maximo
 * @returns {string|null}
 */
export function validarNombre(nombre, maximo) {
  const limpio = String(nombre ?? '').trim();
  if (!limpio) return 'Escribe un nombre.';
  if (limpio.length > maximo) return `El nombre no puede tener más de ${maximo} caracteres.`;
  return null;
}

/**
 * @param {{ email: string, contrasena: string }} datos
 * @returns {string|null}
 */
export function validarInicioSesion({ email, contrasena }) {
  if (!esEmailValido(email)) return 'Escribe un email válido.';
  if (!contrasena) return 'Escribe tu contraseña.';
  return null;
}

/**
 * @param {{ nombre: string, email: string, contrasena: string, repetida: string }} datos
 * @returns {string|null}
 */
export function validarRegistro({ nombre, email, contrasena, repetida }) {
  const errorNombre = validarNombre(nombre, 50);
  if (errorNombre) return errorNombre;
  if (!esEmailValido(email)) return 'Escribe un email válido.';
  if (String(contrasena ?? '').length < LONGITUD_MINIMA_CONTRASENA) {
    return `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`;
  }
  if (contrasena !== repetida) return 'Las contraseñas no coinciden.';
  return null;
}
