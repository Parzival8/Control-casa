// Comprobación de la conexión con Firebase (Fase 0).
// Como todo acceso a Firebase, vive en src/data/: las pantallas no importan Firebase.

import { getApp } from '@react-native-firebase/app';
import { doc, getDocFromServer, getFirestore } from '@react-native-firebase/firestore';

/**
 * @typedef {Object} EstadoConexion
 * @property {boolean} ok         true si se ha llegado al servidor de Firestore.
 * @property {string} proyecto    Id del proyecto de Firebase configurado en la app.
 * @property {string} mensaje     Explicación en español para mostrar en pantalla.
 */

/**
 * Comprueba que la app está configurada con el proyecto de Firebase y que
 * llega al servidor de Firestore.
 *
 * Truco: pedimos un documento que no existe. Como las reglas están en "modo
 * producción" (todo denegado), el servidor responde "permiso denegado". Esa
 * respuesta solo puede venir del servidor, así que demuestra que hay conexión
 * y que las reglas nos protegen. Si no hay red, el error es "unavailable".
 *
 * @returns {Promise<EstadoConexion>}
 */
export async function comprobarConexion() {
  let proyecto = '';
  try {
    proyecto = getApp().options.projectId ?? '';
  } catch {
    return {
      ok: false,
      proyecto,
      mensaje: 'Firebase no está configurado en esta versión de la app.',
    };
  }

  try {
    await getDocFromServer(doc(getFirestore(), 'comprobaciones', 'conexion'));
    // Si algún día las reglas lo permiten, también significa que hay conexión.
    return { ok: true, proyecto, mensaje: 'Conectado a Firebase.' };
  } catch (error) {
    const codigo = String(error?.code ?? '');
    if (codigo.includes('permission-denied')) {
      return {
        ok: true,
        proyecto,
        mensaje: 'Conectado a Firebase. Los datos están protegidos por las reglas.',
      };
    }
    if (codigo.includes('unavailable')) {
      return {
        ok: false,
        proyecto,
        mensaje: 'Sin conexión con el servidor. Revisa que tengas internet.',
      };
    }
    return {
      ok: false,
      proyecto,
      mensaje: `No se ha podido conectar con Firebase (${codigo || 'error desconocido'}).`,
    };
  }
}
