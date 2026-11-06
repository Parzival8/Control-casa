// Categorías del hogar: hogares/{hogarId}/categorias/{categoriaId}.
// Son compartidas: cualquier cambio lo ven al momento todos los miembros.
// Como los gastos, las escrituras no esperan al servidor (funcionan sin conexión).

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

/** @typedef {import('../utils/categoriasIniciales').Categoria} Categoria */

/**
 * @typedef {Object} DatosCategoria
 * @property {string} nombre
 * @property {string} icono                    Emoji.
 * @property {string} color                    "#rrggbb".
 * @property {number|null} presupuestoMensual  Céntimos o null.
 */

const coleccion = (hogarId) => collection(getFirestore(), 'hogares', hogarId, 'categorias');

function sinEsperar(promesa, alFallar) {
  promesa.catch((error) => alFallar?.(error));
}

function limpiar({ nombre, icono, color, presupuestoMensual }) {
  return { nombre: nombre.trim(), icono, color, presupuestoMensual: presupuestoMensual ?? null };
}

/**
 * Escucha las categorías del hogar en tiempo real.
 * @param {string} hogarId
 * @param {(categorias: Categoria[]) => void} alCambiar
 * @param {(error: Error) => void} alFallar
 * @returns {() => void}
 */
export function escucharCategorias(hogarId, alCambiar, alFallar) {
  return onSnapshot(
    coleccion(hogarId),
    (instantanea) => alCambiar(instantanea.docs.map((d) => ({ id: d.id, ...d.data() }))),
    alFallar,
  );
}

/**
 * Crea una categoría nueva.
 * @param {{ hogarId: string, datos: DatosCategoria, alFallar?: (e: Error) => void }} p
 * @returns {string} Id de la categoría.
 */
export function crearCategoria({ hogarId, datos, alFallar }) {
  const referencia = doc(coleccion(hogarId));
  sinEsperar(setDoc(referencia, { ...limpiar(datos), archivada: false }), alFallar);
  return referencia.id;
}

/**
 * Cambia nombre, icono, color o presupuesto.
 * @param {{ hogarId: string, categoriaId: string, datos: DatosCategoria, alFallar?: (e: Error) => void }} p
 */
export function editarCategoria({ hogarId, categoriaId, datos, alFallar }) {
  sinEsperar(updateDoc(doc(coleccion(hogarId), categoriaId), limpiar(datos)), alFallar);
}

/**
 * Archiva (deja de ofrecerse al apuntar) o recupera una categoría.
 * @param {{ hogarId: string, categoriaId: string, archivada: boolean, alFallar?: (e: Error) => void }} p
 */
export function archivarCategoria({ hogarId, categoriaId, archivada, alFallar }) {
  sinEsperar(updateDoc(doc(coleccion(hogarId), categoriaId), { archivada }), alFallar);
}

/**
 * ¿Hay algún gasto (de cualquier mes) con esta categoría? Solo lee uno.
 * @param {string} hogarId
 * @param {string} categoriaId
 * @returns {Promise<boolean>}
 */
export async function categoriaTieneGastos(hogarId, categoriaId) {
  const consulta = query(
    collection(getFirestore(), 'hogares', hogarId, 'gastos'),
    where('categoriaId', '==', categoriaId),
    limit(1),
  );
  const instantanea = await getDocs(consulta);
  return !instantanea.empty;
}

/**
 * Borra una categoría. Solo debe usarse si no tiene gastos (si no, archivar).
 * @param {{ hogarId: string, categoriaId: string, alFallar?: (e: Error) => void }} p
 */
export function borrarCategoria({ hogarId, categoriaId, alFallar }) {
  sinEsperar(deleteDoc(doc(coleccion(hogarId), categoriaId)), alFallar);
}
