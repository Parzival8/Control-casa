// Gastos del hogar: hogares/{hogarId}/gastos/{gastoId} (ESPECIFICACION.md, sección 4).
//
// Sin conexión: Firestore guarda los cambios en el móvil, los muestra al
// instante y los envía al servidor cuando vuelve la red. Por eso guardar NO
// espera a que responda el servidor (si no, sin red la pantalla se quedaría
// esperando). Si el servidor lo rechaza más tarde, se avisa con alFallar.

import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

import { rangoDelMes } from '../utils/meses';

/** @typedef {import('../utils/gastos').Gasto} Gasto */

/**
 * @typedef {Object} DatosGasto
 * @property {number} importe          Céntimos.
 * @property {string} categoriaId
 * @property {string} fecha            "YYYY-MM-DD".
 * @property {string} nota
 * @property {string|null} pagadoPor   uid o null (sin indicar).
 */

const coleccionGastos = (hogarId) => collection(getFirestore(), 'hogares', hogarId, 'gastos');

/** Lanza la escritura sin esperar al servidor y avisa si falla. */
function sinEsperar(promesa, alFallar) {
  promesa.catch((error) => alFallar?.(error));
}

/** Convierte un documento de Firestore en un Gasto. */
function aGasto(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    importe: datos.importe,
    categoriaId: datos.categoriaId,
    fecha: datos.fecha,
    nota: datos.nota ?? '',
    pagadoPor: datos.pagadoPor ?? null,
    creadoPor: datos.creadoPor,
    editadoPor: datos.editadoPor,
    recurrenteId: datos.recurrenteId ?? null,
    // null mientras el servidor no ha puesto la hora (p. ej. sin conexión).
    creadoEn: datos.creadoEn ? datos.creadoEn.toDate() : null,
  };
}

/** Deja solo los campos que se guardan (sin espacios sobrantes en la nota). */
function limpiar({ importe, categoriaId, fecha, nota, pagadoPor }) {
  return { importe, categoriaId, fecha, nota: (nota ?? '').trim(), pagadoPor: pagadoPor ?? null };
}

/**
 * Apunta un gasto nuevo.
 * @param {{ hogarId: string, uid: string, datos: DatosGasto, alFallar?: (e: Error) => void }} p
 * @returns {string} Id del gasto.
 */
export function crearGasto({ hogarId, uid, datos, alFallar }) {
  const referencia = doc(coleccionGastos(hogarId));
  sinEsperar(
    setDoc(referencia, {
      ...limpiar(datos),
      creadoPor: uid,
      editadoPor: uid,
      recurrenteId: null,
      creadoEn: serverTimestamp(),
      editadoEn: serverTimestamp(),
    }),
    alFallar,
  );
  return referencia.id;
}

/**
 * Modifica un gasto (cualquier miembro puede).
 * @param {{ hogarId: string, gastoId: string, uid: string, datos: DatosGasto,
 *           alFallar?: (e: Error) => void }} p
 */
export function editarGasto({ hogarId, gastoId, uid, datos, alFallar }) {
  sinEsperar(
    updateDoc(doc(coleccionGastos(hogarId), gastoId), {
      ...limpiar(datos),
      editadoPor: uid,
      editadoEn: serverTimestamp(),
    }),
    alFallar,
  );
}

/**
 * Borra un gasto.
 * @param {{ hogarId: string, gastoId: string, alFallar?: (e: Error) => void }} p
 */
export function borrarGasto({ hogarId, gastoId, alFallar }) {
  sinEsperar(deleteDoc(doc(coleccionGastos(hogarId), gastoId)), alFallar);
}

/**
 * Escucha en tiempo real los gastos de un periodo de meses (ambos incluidos).
 * Se usa para las estadísticas de los últimos 12 meses: está acotado, nunca
 * se cargan todos los gastos del hogar.
 * @param {string} hogarId
 * @param {string} desdeMes "YYYY-MM"
 * @param {string} hastaMes "YYYY-MM"
 * @param {(gastos: Gasto[]) => void} alCambiar
 * @param {(error: Error) => void} alFallar
 * @returns {() => void}
 */
export function escucharGastosEntre(hogarId, desdeMes, hastaMes, alCambiar, alFallar) {
  const consulta = query(
    coleccionGastos(hogarId),
    where('fecha', '>=', rangoDelMes(desdeMes).desde),
    where('fecha', '<=', rangoDelMes(hastaMes).hasta),
    orderBy('fecha', 'desc'),
  );
  return onSnapshot(consulta, (instantanea) => alCambiar(instantanea.docs.map(aGasto)), alFallar);
}

/**
 * Escucha en tiempo real los gastos de un mes (nunca carga todos).
 * @param {string} hogarId
 * @param {string} mes "YYYY-MM"
 * @param {(gastos: Gasto[]) => void} alCambiar
 * @param {(error: Error) => void} alFallar
 * @returns {() => void}
 */
export function escucharGastosDelMes(hogarId, mes, alCambiar, alFallar) {
  const { desde, hasta } = rangoDelMes(mes);
  const consulta = query(
    coleccionGastos(hogarId),
    where('fecha', '>=', desde),
    where('fecha', '<=', hasta),
    orderBy('fecha', 'desc'),
  );
  return onSnapshot(
    consulta,
    (instantanea) => alCambiar(instantanea.docs.map(aGasto)),
    alFallar,
  );
}

/**
 * Escucha un gasto concreto.
 * @param {string} hogarId
 * @param {string} gastoId
 * @param {(gasto: Gasto|null) => void} alCambiar  null si no existe.
 * @param {(error: Error) => void} alFallar
 * @returns {() => void}
 */
export function escucharGasto(hogarId, gastoId, alCambiar, alFallar) {
  return onSnapshot(
    doc(coleccionGastos(hogarId), gastoId),
    (instantanea) => alCambiar(instantanea.exists() ? aGasto(instantanea) : null),
    alFallar,
  );
}
