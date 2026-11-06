import { categoriasIniciales } from './categoriasIniciales';

const ORDEN_INICIAL = new Map(categoriasIniciales.map((c, i) => [c.id, i]));

/**
 * Ordena las categorías: primero las iniciales en su orden de siempre
 * (Hipoteca, Luz, Agua…) y después las creadas por el hogar, por nombre.
 * @param {import('./categoriasIniciales').Categoria[]} categorias
 * @returns {import('./categoriasIniciales').Categoria[]} Copia ordenada.
 */
export function ordenarCategorias(categorias) {
  const posicion = (c) => ORDEN_INICIAL.get(c.id) ?? Number.MAX_SAFE_INTEGER;
  return [...categorias].sort(
    (a, b) => posicion(a) - posicion(b) || a.nombre.localeCompare(b.nombre, 'es'),
  );
}

/**
 * Categorías que se pueden elegir al apuntar: las no archivadas, más la que
 * ya tenga el gasto (aunque esté archivada) para no perderla al editar.
 * @param {import('./categoriasIniciales').Categoria[]} categorias
 * @param {string|null} [actual]
 */
export function categoriasElegibles(categorias, actual = null) {
  return ordenarCategorias(categorias.filter((c) => !c.archivada || c.id === actual));
}
