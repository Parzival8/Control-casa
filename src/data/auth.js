// Cuentas de usuario: registro, inicio y cierre de sesión, recuperar contraseña.
// La sesión se guarda en el móvil automáticamente (no hay que volver a entrar).

import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setLanguageCode,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';

import { crearPerfil } from './usuarios';

/**
 * @typedef {Object} UsuarioSesion
 * @property {string} uid
 * @property {string} email
 * @property {string} nombre   Nombre visible (displayName).
 */

/** @returns {UsuarioSesion|null} */
function aUsuarioSesion(usuario) {
  if (!usuario) return null;
  return { uid: usuario.uid, email: usuario.email ?? '', nombre: usuario.displayName ?? '' };
}

/**
 * Escucha los cambios de sesión (entrar, salir, arrancar la app con sesión).
 * @param {(usuario: UsuarioSesion|null) => void} callback
 * @returns {() => void} Función para dejar de escuchar.
 */
export function escucharSesion(callback) {
  return onAuthStateChanged(getAuth(), (usuario) => callback(aUsuarioSesion(usuario)));
}

/**
 * Crea la cuenta y su documento users/{uid}.
 * @param {{ nombre: string, email: string, contrasena: string }} datos
 */
export async function registrar({ nombre, email, contrasena }) {
  const credencial = await createUserWithEmailAndPassword(getAuth(), email.trim(), contrasena);
  const nombreLimpio = nombre.trim();
  await updateProfile(credencial.user, { displayName: nombreLimpio });
  await crearPerfil({ uid: credencial.user.uid, nombre: nombreLimpio, email: credencial.user.email });
}

/**
 * @param {{ email: string, contrasena: string }} datos
 */
export async function iniciarSesion({ email, contrasena }) {
  await signInWithEmailAndPassword(getAuth(), email.trim(), contrasena);
}

export async function cerrarSesion() {
  await signOut(getAuth());
}

/**
 * Envía el email para elegir una contraseña nueva (en español).
 * @param {string} email
 */
export async function recuperarContrasena(email) {
  const auth = getAuth();
  await setLanguageCode(auth, 'es');
  await sendPasswordResetEmail(auth, email.trim());
}
