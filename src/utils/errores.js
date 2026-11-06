// Traduce los errores de Firebase (y los nuestros) a mensajes claros en español.

/** Errores propios de la app, con el mismo formato que los de Firebase. */
export const ERRORES_APP = {
  CODIGO_FORMATO: 'app/codigo-formato',
  CODIGO_NO_EXISTE: 'app/codigo-no-existe',
  CODIGO_CADUCADO: 'app/codigo-caducado',
  YA_EN_HOGAR: 'app/ya-en-hogar',
  SIN_CONEXION: 'app/sin-conexion',
};

const MENSAJES = {
  // Cuentas
  'auth/invalid-email': 'El email no es válido.',
  'auth/missing-email': 'Escribe tu email.',
  'auth/user-not-found': 'El email o la contraseña no son correctos.',
  'auth/wrong-password': 'El email o la contraseña no son correctos.',
  'auth/invalid-credential': 'El email o la contraseña no son correctos.',
  'auth/invalid-login-credentials': 'El email o la contraseña no son correctos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email. Prueba a iniciar sesión.',
  'auth/weak-password': 'La contraseña es demasiado débil: usa al menos 6 caracteres.',
  'auth/user-disabled': 'Esta cuenta está desactivada.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
  'auth/network-request-failed': 'No hay conexión a internet. Revísala y vuelve a probar.',
  'auth/operation-not-allowed': 'El inicio de sesión con email no está activado.',
  // Base de datos
  'firestore/permission-denied': 'No tienes permiso para hacer esto.',
  'firestore/unavailable': 'No hay conexión con el servidor. Revisa tu internet.',
  'firestore/deadline-exceeded': 'El servidor tarda demasiado en responder. Vuelve a probar.',
  'firestore/not-found': 'No se ha encontrado lo que buscabas.',
  // Propios
  [ERRORES_APP.CODIGO_FORMATO]: 'El código tiene 8 letras y números. Revisa que esté bien escrito.',
  [ERRORES_APP.CODIGO_NO_EXISTE]: 'Ese código no existe o ya no es válido. Pide uno nuevo.',
  [ERRORES_APP.CODIGO_CADUCADO]: 'Ese código ha caducado. Pide a alguien del hogar uno nuevo.',
  [ERRORES_APP.YA_EN_HOGAR]: 'Ya perteneces a un hogar.',
  [ERRORES_APP.SIN_CONEXION]: 'Necesitas conexión a internet para hacer esto.',
};

const MENSAJE_GENERICO = 'Ha ocurrido un error inesperado. Vuelve a intentarlo.';

/**
 * Crea un error con código propio de la app.
 * @param {string} codigo Uno de ERRORES_APP.
 * @returns {Error & { code: string }}
 */
export function crearError(codigo) {
  const error = new Error(MENSAJES[codigo] ?? MENSAJE_GENERICO);
  error.code = codigo;
  return error;
}

/**
 * Mensaje para mostrar al usuario a partir de cualquier error.
 * @param {unknown} error
 * @returns {string}
 */
export function mensajeDeError(error) {
  const codigo = String(error?.code ?? '');
  return MENSAJES[codigo] ?? MENSAJE_GENERICO;
}
