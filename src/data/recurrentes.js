// Gastos fijos: hogares/{hogarId}/recurrentes/{recurrenteId}.
// Al abrir la app se apuntan solos los que toca este mes (generarGastosFijos).

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';

import { fechaGastoFijo, idGastoFijo, tocaGenerar } from '../utils/recurrentes';

/** @typedef {import('../utils/recurrentes').Recurrente} Recurrente */

/**
 * @typedef {Object} DatosRecurrente
 * @property {number} importe
 * @property {string} categoriaId
 * @property {number} diaDelMes
 * @property {string} nota
 * @property {string|null} pagadoPor
 * @property {boolean} activo
 */

const coleccion = (hogarId) => collection(getFirestore(), 'hogares', hogarId, 'recurrentes');

function sinEsperar(promesa, alFallar) {
  promesa.catch((error) => alFallar?.(error));
}

function limpiar({ importe, categoriaId, diaDelMes, nota, pagadoPor, activo }) {
  return { importe, categoriaId, diaDelMes, nota: (nota ?? '').trim(), pagadoPor: pagadoPor ?? null, activo };
}

/**
 * @param {string} hogarId
 * @param {(recurrentes: Recurrente[]) => void} alCambiar
 * @param {(error: Error) => void} alFallar
 * @returns {() => void}
 */
export function escucharRecurrentes(hogarId, alCambiar, alFallar) {
  return onSnapshot(
    coleccion(hogarId),
    (instantanea) =>
      alCambiar(
        instantanea.docs.map((d) => ({ id: d.id, ultimoMesGenerado: null, ...d.data() })),
      ),
    alFallar,
  );
}

/**
 * @param {{ hogarId: string, datos: DatosRecurrente, alFallar?: (e: Error) => void }} p
 * @returns {string} Id del gasto fijo.
 */
export function crearRecurrente({ hogarId, datos, alFallar }) {
  const referencia = doc(coleccion(hogarId));
  sinEsperar(setDoc(referencia, { ...limpiar(datos), ultimoMesGenerado: null }), alFallar);
  return referencia.id;
}

/**
 * @param {{ hogarId: string, recurrenteId: string, datos: DatosRecurrente, alFallar?: (e: Error) => void }} p
 */
export function editarRecurrente({ hogarId, recurrenteId, datos, alFallar }) {
  sinEsperar(updateDoc(doc(coleccion(hogarId), recurrenteId), limpiar(datos)), alFallar);
}

/**
 * Borra el gasto fijo (los gastos que ya generó se quedan).
 * @param {{ hogarId: string, recurrenteId: string, alFallar?: (e: Error) => void }} p
 */
export function borrarRecurrente({ hogarId, recurrenteId, alFallar }) {
  sinEsperar(deleteDoc(doc(coleccion(hogarId), recurrenteId)), alFallar);
}

/**
 * Apunta los gastos fijos a los que les ha llegado su día este mes.
 *
 * Cada uno va en una transacción que vuelve a leer el fijo en el servidor: si
 * otro miembro lo acaba de apuntar, `ultimoMesGenerado` ya es este mes y no se
 * hace nada. Además el gasto tiene un id determinista ({fijo}_{YYYY-MM}) y las
 * reglas impiden sobrescribirlo: no se puede duplicar.
 * Sin conexión las transacciones fallan; se reintentará la próxima vez.
 *
 * @param {{ hogarId: string, uid: string, miembros: string[], hoy: string }} p
 * @returns {Promise<number>} Cuántos gastos se han apuntado.
 */
export async function generarGastosFijos({ hogarId, uid, miembros, hoy }) {
  const db = getFirestore();
  const mes = hoy.slice(0, 7);
  const instantanea = await getDocs(coleccion(hogarId));
  const candidatos = instantanea.docs
    .map((d) => ({ id: d.id, ultimoMesGenerado: null, ...d.data() }))
    .filter((r) => tocaGenerar(r, hoy));

  let apuntados = 0;
  for (const candidato of candidatos) {
    try {
      const apuntado = await runTransaction(db, async (transaccion) => {
        const refFijo = doc(coleccion(hogarId), candidato.id);
        const fijo = await transaccion.get(refFijo);
        if (!fijo.exists()) return false;
        const datos = { id: fijo.id, ultimoMesGenerado: null, ...fijo.data() };
        if (!tocaGenerar(datos, hoy)) return false; // otro miembro se adelantó

        const refGasto = doc(db, 'hogares', hogarId, 'gastos', idGastoFijo(datos.id, mes));
        const gasto = await transaccion.get(refGasto);
        if (!gasto.exists()) {
          transaccion.set(refGasto, {
            importe: datos.importe,
            categoriaId: datos.categoriaId,
            fecha: fechaGastoFijo(mes, datos.diaDelMes),
            nota: datos.nota ?? '',
            // Si quien pagaba ya no está en el hogar, queda "sin indicar".
            pagadoPor: datos.pagadoPor && miembros.includes(datos.pagadoPor) ? datos.pagadoPor : null,
            creadoPor: uid,
            editadoPor: uid,
            recurrenteId: datos.id,
            creadoEn: serverTimestamp(),
            editadoEn: serverTimestamp(),
          });
        }
        transaccion.update(refFijo, { ultimoMesGenerado: mes });
        return !gasto.exists();
      });
      if (apuntado) apuntados++;
    } catch {
      // Sin conexión o rechazado: no pasa nada, se intentará la próxima vez.
    }
  }
  return apuntados;
}
