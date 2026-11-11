// Cuentas de usuario: registro, inicio y cierre de sesión, recuperar contraseña.
// La sesión se guarda en el móvil automáticamente (no hay que volver a entrar).

import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setLanguageCode,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';

import { borrarHogar, borrarMiNombreDeHogares, salirDelHogar } from './gestionHogar';
import { borrarPerfil, crearPerfil } from './usuarios';
import { consecuenciaDeIrse } from '../utils/gestionHogar';

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

/**
 * Cambia el nombre visible de la cuenta (además del perfil y del hogar, que
 * se cambian en src/data/gestionHogar.js).
 * @param {string} nombre
 */
export async function cambiarNombreCuenta(nombre) {
  const usuario = getAuth().currentUser;
  if (usuario) await updateProfile(usuario, { displayName: nombre.trim() });
}

/**
 * Elimina la cuenta y los datos personales (obligatorio para Google Play).
 *
 * Pasos, en este orden:
 *  1. Comprobar la contraseña (Firebase lo exige para borrar una cuenta).
 *  2. Salir del hogar actual borrando el nombre. Si es el creador: dejar el
 *     hogar a `sucesor`, o borrarlo entero si está solo.
 *  3. Borrar su nombre de los hogares de los que salió antes.
 *  4. Borrar su perfil (users/{uid}).
 *  5. Borrar la cuenta de acceso. La app vuelve sola a "Iniciar sesión".
 * Los gastos que apuntó se quedan en el hogar, sin su nombre.
 *
 * @param {{ contrasena: string,
 *           perfil: import('./usuarios').Perfil|null,
 *           hogar: import('./hogares').Hogar|null,
 *           sucesor?: string|null,
 *           alProgresar?: (texto: string) => void }} p
 */
export async function eliminarCuenta({ contrasena, perfil, hogar, sucesor = null, alProgresar }) {
  const usuario = getAuth().currentUser;
  if (!usuario) return;

  alProgresar?.('Comprobando la contraseña…');
  await reauthenticateWithCredential(
    usuario,
    EmailAuthProvider.credential(usuario.email, contrasena),
  );

  if (hogar) {
    const consecuencia = consecuenciaDeIrse(hogar, usuario.uid);
    if (consecuencia === 'borrar') {
      await borrarHogar({ hogar, uid: usuario.uid, alProgresar });
    } else {
      alProgresar?.('Saliendo del hogar…');
      await salirDelHogar({
        hogarId: hogar.id,
        uid: usuario.uid,
        sucesor: consecuencia === 'traspasar' ? sucesor : null,
        borrarMiNombre: true,
      });
    }
  }

  alProgresar?.('Borrando tus datos…');
  await borrarMiNombreDeHogares({ uid: usuario.uid, hogares: perfil?.hogaresAnteriores ?? [] });
  await borrarPerfil(usuario.uid);

  alProgresar?.('Eliminando la cuenta…');
  await deleteUser(usuario);
}
