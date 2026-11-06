// Hogares compartidos e invitaciones (ver ESPECIFICACION.md, secciones 3 y 4).
// Las reglas de firestore.rules validan cada una de estas escrituras.

import {
  Timestamp,
  arrayUnion,
  collection,
  doc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from '@react-native-firebase/firestore';

import { categoriasIniciales } from '../utils/categoriasIniciales';
import {
  esFormatoCodigoValido,
  fechaCaducidadCodigo,
  generarCodigo,
  normalizarCodigo,
} from '../utils/codigoInvitacion';
import { ERRORES_APP, crearError } from '../utils/errores';
import { asegurarPerfil, refPerfil } from './usuarios';

/**
 * @typedef {Object} Hogar
 * @property {string} id
 * @property {string} nombre
 * @property {string} creadoPor                     uid del creador.
 * @property {string[]} miembros                    uids de los miembros.
 * @property {Object<string, {nombre: string}>} miembrosInfo
 * @property {string} codigoInvitacion              Código vigente.
 */

/**
 * @typedef {Object} Invitacion
 * @property {string} codigo
 * @property {string} hogarId
 * @property {Date} expiraEn
 */

/** Veces que se reintenta si el código generado ya existía (muy improbable). */
const INTENTOS_CODIGO = 3;

const db = () => getFirestore();
const refHogar = (hogarId) => doc(db(), 'hogares', hogarId);
const refInvitacion = (codigo) => doc(db(), 'invitaciones', codigo);

function esPermisoDenegado(error) {
  return String(error?.code ?? '').includes('permission-denied');
}

function esSinConexion(error) {
  return String(error?.code ?? '').includes('unavailable');
}

/**
 * Crea un hogar con su invitación y las categorías iniciales (en un único
 * lote: o se guarda entero o nada) y después lo asigna al usuario.
 * @param {{ usuario: import('./auth').UsuarioSesion, nombreUsuario: string, nombreHogar: string }} datos
 * @returns {Promise<string>} Id del hogar creado.
 */
export async function crearHogar({ usuario, nombreUsuario, nombreHogar }) {
  await asegurarPerfil(usuario);

  for (let intento = 1; intento <= INTENTOS_CODIGO; intento++) {
    const codigo = generarCodigo();
    const hogar = doc(collection(db(), 'hogares'));
    const lote = writeBatch(db());

    lote.set(hogar, {
      nombre: nombreHogar.trim(),
      creadoPor: usuario.uid,
      miembros: [usuario.uid],
      miembrosInfo: { [usuario.uid]: { nombre: nombreUsuario } },
      codigoInvitacion: codigo,
      creadoEn: serverTimestamp(),
    });
    lote.set(refInvitacion(codigo), {
      hogarId: hogar.id,
      creadoPor: usuario.uid,
      expiraEn: Timestamp.fromDate(fechaCaducidadCodigo()),
    });
    for (const { id, ...categoria } of categoriasIniciales) {
      lote.set(doc(db(), 'hogares', hogar.id, 'categorias', id), categoria);
    }

    try {
      await lote.commit();
    } catch (error) {
      // Si el código ya existía, las reglas lo rechazan: se prueba con otro.
      if (!esPermisoDenegado(error) || intento === INTENTOS_CODIGO) throw error;
      continue;
    }
    // El perfil se actualiza solo cuando el servidor ya ha creado el hogar.
    // Si fuera en el mismo lote, la app cambiaría de pantalla al instante y
    // pediría el hogar al servidor antes de que existiera (permiso denegado).
    await updateDoc(refPerfil(usuario.uid), { hogarId: hogar.id });
    return hogar.id;
  }
  throw crearError(ERRORES_APP.SIN_CONEXION);
}

/**
 * Busca una invitación por su código. Necesita conexión.
 * @param {string} codigo Ya normalizado.
 * @returns {Promise<Invitacion>}
 */
async function buscarInvitacion(codigo) {
  let instantanea;
  try {
    instantanea = await getDocFromServer(refInvitacion(codigo));
  } catch (error) {
    if (esSinConexion(error)) throw crearError(ERRORES_APP.SIN_CONEXION);
    throw error;
  }
  if (!instantanea.exists()) throw crearError(ERRORES_APP.CODIGO_NO_EXISTE);
  const datos = instantanea.data();
  const expiraEn = datos.expiraEn.toDate();
  if (expiraEn <= new Date()) throw crearError(ERRORES_APP.CODIGO_CADUCADO);
  return { codigo, hogarId: datos.hogarId, expiraEn };
}

/**
 * Se une a un hogar con un código de invitación.
 * El propio código va en la escritura (miembrosInfo.{uid}.codigoUsado): así
 * las reglas comprueban que es válido sin necesidad de un servidor propio.
 * @param {{ usuario: import('./auth').UsuarioSesion, nombreUsuario: string, codigo: string }} datos
 * @returns {Promise<string>} Id del hogar.
 */
export async function unirseConCodigo({ usuario, nombreUsuario, codigo }) {
  const limpio = normalizarCodigo(codigo);
  if (!esFormatoCodigoValido(limpio)) throw crearError(ERRORES_APP.CODIGO_FORMATO);

  await asegurarPerfil(usuario);
  const invitacion = await buscarInvitacion(limpio);

  try {
    await updateDoc(refHogar(invitacion.hogarId), {
      miembros: arrayUnion(usuario.uid),
      [`miembrosInfo.${usuario.uid}`]: { nombre: nombreUsuario, codigoUsado: limpio },
    });
  } catch (error) {
    // Las reglas lo rechazan si el código ya no es el vigente (regenerado),
    // si ha caducado justo ahora o si ya eras miembro.
    if (esPermisoDenegado(error)) throw crearError(ERRORES_APP.CODIGO_NO_EXISTE);
    throw error;
  }
  // Solo cuando el servidor ya te tiene como miembro (ver crearHogar).
  await updateDoc(refPerfil(usuario.uid), { hogarId: invitacion.hogarId });
  return invitacion.hogarId;
}

/**
 * Escucha un hogar en tiempo real.
 * @param {string} hogarId
 * @param {(hogar: Hogar|null, info: {desdeCache: boolean}) => void} alCambiar
 *   hogar null si no existe; desdeCache true si aún no ha respondido el servidor.
 * @param {(error: Error) => void} alFallar  p. ej. sin permiso si te expulsan.
 * @returns {() => void}
 */
export function escucharHogar(hogarId, alCambiar, alFallar) {
  return onSnapshot(
    refHogar(hogarId),
    (instantanea) =>
      alCambiar(instantanea.exists() ? { id: instantanea.id, ...instantanea.data() } : null, {
        desdeCache: instantanea.metadata.fromCache,
      }),
    alFallar,
  );
}

/**
 * Lee la caducidad del código vigente.
 * @param {string} codigo
 * @returns {Promise<Date|null>} null si la invitación ya no existe.
 */
export async function leerCaducidadCodigo(codigo) {
  const instantanea = await getDocFromServer(refInvitacion(codigo));
  return instantanea.exists() ? instantanea.data().expiraEn.toDate() : null;
}

/**
 * Genera un código nuevo (solo el creador). El anterior deja de valer.
 * @param {{ hogar: Hogar, uid: string }} datos
 * @returns {Promise<string>} El código nuevo.
 */
export async function regenerarCodigo({ hogar, uid }) {
  for (let intento = 1; intento <= INTENTOS_CODIGO; intento++) {
    const codigo = generarCodigo();
    const lote = writeBatch(db());
    lote.update(refHogar(hogar.id), { codigoInvitacion: codigo });
    lote.set(refInvitacion(codigo), {
      hogarId: hogar.id,
      creadoPor: uid,
      expiraEn: Timestamp.fromDate(fechaCaducidadCodigo()),
    });
    lote.delete(refInvitacion(hogar.codigoInvitacion));
    try {
      await lote.commit();
      return codigo;
    } catch (error) {
      if (!esPermisoDenegado(error) || intento === INTENTOS_CODIGO) throw error;
    }
  }
  throw crearError(ERRORES_APP.SIN_CONEXION);
}
