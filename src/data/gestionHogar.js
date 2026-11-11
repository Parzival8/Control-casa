// Gestión del hogar: nombre, miembros, salir, expulsar y borrar.
// Las reglas (firestore.rules) validan cada operación en el servidor.

import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
  writeBatch,
} from '@react-native-firebase/firestore';

import { refPerfil } from './usuarios';

/** Máximo de operaciones por lote de Firestore (el límite es 500). */
const TAMANO_LOTE = 400;

const db = () => getFirestore();
const refHogar = (hogarId) => doc(db(), 'hogares', hogarId);

/**
 * Cambia el nombre del hogar (cualquier miembro).
 * @param {{ hogarId: string, nombre: string }} p
 */
export async function cambiarNombreHogar({ hogarId, nombre }) {
  await updateDoc(refHogar(hogarId), { nombre: nombre.trim() });
}

/**
 * Cambia el nombre de la persona en su perfil y en su hogar.
 * @param {{ uid: string, hogarId: string|null, nombre: string }} p
 */
export async function cambiarMiNombre({ uid, hogarId, nombre }) {
  const limpio = nombre.trim();
  const lote = writeBatch(db());
  lote.update(refPerfil(uid), { nombre: limpio });
  if (hogarId) lote.update(refHogar(hogarId), { [`miembrosInfo.${uid}.nombre`]: limpio });
  await lote.commit();
}

/**
 * El creador quita a un miembro. Su nombre se conserva en el hogar para que
 * sus gastos antiguos sigan mostrándolo (decisión del usuario, Fase 6).
 * @param {{ hogarId: string, uidExpulsado: string }} p
 */
export async function expulsarMiembro({ hogarId, uidExpulsado }) {
  await updateDoc(refHogar(hogarId), { miembros: arrayRemove(uidExpulsado) });
}

/**
 * Salir del hogar. Si quien sale es el creador, deja el hogar a `sucesor`.
 * El perfil se actualiza en el mismo lote, así la app cambia de pantalla
 * a la vez que deja de ser miembro.
 * @param {{ hogarId: string, uid: string, sucesor?: string|null, borrarMiNombre?: boolean }} p
 *   borrarMiNombre: true al eliminar la cuenta (no deja datos personales).
 */
export async function salirDelHogar({ hogarId, uid, sucesor = null, borrarMiNombre = false }) {
  const cambios = { miembros: arrayRemove(uid) };
  if (sucesor) cambios.creadoPor = sucesor;
  if (borrarMiNombre) cambios[`miembrosInfo.${uid}`] = deleteField();

  const lote = writeBatch(db());
  lote.update(refHogar(hogarId), cambios);
  lote.update(refPerfil(uid), { hogarId: null, hogaresAnteriores: arrayUnion(hogarId) });
  await lote.commit();
}

/** Borra todos los documentos de una subcolección, por lotes. */
async function vaciarSubcoleccion(hogarId, nombre) {
  const instantanea = await getDocs(collection(db(), 'hogares', hogarId, nombre));
  for (let i = 0; i < instantanea.docs.length; i += TAMANO_LOTE) {
    const lote = writeBatch(db());
    for (const d of instantanea.docs.slice(i, i + TAMANO_LOTE)) lote.delete(d.ref);
    await lote.commit();
  }
  return instantanea.size;
}

/**
 * Borra el hogar entero (solo el creador): gastos, categorías, gastos fijos,
 * invitación y el propio hogar. Necesita conexión.
 * Los demás miembros verán "No se puede abrir el hogar" y podrán empezar de nuevo.
 * @param {{ hogar: { id: string, codigoInvitacion: string }, uid: string,
 *           alProgresar?: (texto: string) => void }} p
 */
export async function borrarHogar({ hogar, uid, alProgresar }) {
  alProgresar?.('Borrando gastos…');
  await vaciarSubcoleccion(hogar.id, 'gastos');
  alProgresar?.('Borrando gastos fijos…');
  await vaciarSubcoleccion(hogar.id, 'recurrentes');
  alProgresar?.('Borrando categorías…');
  await vaciarSubcoleccion(hogar.id, 'categorias');
  alProgresar?.('Borrando el hogar…');
  const lote = writeBatch(db());
  lote.delete(doc(db(), 'invitaciones', hogar.codigoInvitacion));
  lote.delete(refHogar(hogar.id));
  lote.update(refPerfil(uid), { hogarId: null });
  await lote.commit();
}

/**
 * Al eliminar la cuenta: borra el nombre de la persona de los hogares de los
 * que salió antes. Si alguno ya no existe, se ignora.
 * @param {{ uid: string, hogares: string[] }} p
 */
export async function borrarMiNombreDeHogares({ uid, hogares }) {
  for (const hogarId of hogares) {
    try {
      await updateDoc(refHogar(hogarId), { [`miembrosInfo.${uid}`]: deleteField() });
    } catch {
      // El hogar ya no existe o el nombre ya no estaba: nada que borrar.
    }
  }
}
