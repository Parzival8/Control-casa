// Perfil de cada usuario: users/{uid} (ver ESPECIFICACION.md, sección 4).

import {
  doc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';

/**
 * @typedef {Object} Perfil
 * @property {string} nombre
 * @property {string} email
 * @property {string|null} hogarId   Hogar al que pertenece, o null.
 */

/** Referencia a users/{uid}. */
export function refPerfil(uid) {
  return doc(getFirestore(), 'users', uid);
}

/**
 * Crea el documento del usuario (sin hogar todavía).
 * @param {{ uid: string, nombre: string, email: string }} datos
 */
export async function crearPerfil({ uid, nombre, email }) {
  await setDoc(refPerfil(uid), {
    nombre,
    email,
    hogarId: null,
    creadoEn: serverTimestamp(),
  });
}

/**
 * Se asegura de que el perfil existe (por si el registro se cortó a medias).
 * @param {{ uid: string, nombre: string, email: string }} usuario
 */
export async function asegurarPerfil(usuario) {
  const instantanea = await getDocFromServer(refPerfil(usuario.uid));
  if (!instantanea.exists()) {
    await crearPerfil({
      uid: usuario.uid,
      nombre: usuario.nombre || usuario.email.split('@')[0],
      email: usuario.email,
    });
  }
}

/**
 * Escucha el perfil en tiempo real.
 * @param {string} uid
 * @param {(perfil: Perfil|null) => void} alCambiar  null si aún no existe.
 * @param {(error: Error) => void} alFallar
 * @returns {() => void}
 */
export function escucharPerfil(uid, alCambiar, alFallar) {
  return onSnapshot(
    refPerfil(uid),
    (instantanea) => alCambiar(instantanea.exists() ? instantanea.data() : null),
    alFallar,
  );
}

/**
 * Quita el hogar del perfil (por ejemplo, si te han expulsado).
 * @param {string} uid
 */
export async function olvidarHogar(uid) {
  await updateDoc(refPerfil(uid), { hogarId: null });
}
