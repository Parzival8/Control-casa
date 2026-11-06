// Categorías del hogar: hogares/{hogarId}/categorias/{categoriaId}.
// (Crear, editar y archivar llegan en la Fase 3.)

import { collection, getFirestore, onSnapshot } from '@react-native-firebase/firestore';

/** @typedef {import('../utils/categoriasIniciales').Categoria} Categoria */

/**
 * Escucha las categorías del hogar en tiempo real.
 * @param {string} hogarId
 * @param {(categorias: Categoria[]) => void} alCambiar
 * @param {(error: Error) => void} alFallar
 * @returns {() => void}
 */
export function escucharCategorias(hogarId, alCambiar, alFallar) {
  return onSnapshot(
    collection(getFirestore(), 'hogares', hogarId, 'categorias'),
    (instantanea) =>
      alCambiar(instantanea.docs.map((d) => ({ id: d.id, ...d.data() }))),
    alFallar,
  );
}
