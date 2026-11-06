// Resumen por categoría y filtros de la lista de gastos (funciones puras).

/** Valor del filtro "pagado por" para los gastos sin indicar. */
export const SIN_INDICAR = 'sin-indicar';

/**
 * @typedef {Object} LineaResumen
 * @property {string} categoriaId
 * @property {string} nombre
 * @property {string} icono
 * @property {string} color
 * @property {number} total       Céntimos.
 * @property {number} porcentaje  Parte del total del mes, de 0 a 100 (para la barra).
 */

/**
 * Agrupa los gastos por categoría, de mayor a menor importe.
 * La suma de los `total` es exactamente la suma de todos los gastos (céntimos).
 * @param {import('./gastos').Gasto[]} gastos
 * @param {import('./categoriasIniciales').Categoria[]} categorias
 * @returns {LineaResumen[]}
 */
export function resumenPorCategoria(gastos, categorias) {
  const porId = new Map(categorias.map((c) => [c.id, c]));
  const totales = new Map();
  for (const g of gastos) totales.set(g.categoriaId, (totales.get(g.categoriaId) ?? 0) + g.importe);

  const totalMes = [...totales.values()].reduce((a, b) => a + b, 0);
  return [...totales.entries()]
    .map(([categoriaId, total]) => {
      const c = porId.get(categoriaId);
      return {
        categoriaId,
        nombre: c?.nombre ?? 'Sin categoría',
        icono: c?.icono ?? '📦',
        color: c?.color ?? '#94a3b8',
        total,
        porcentaje: totalMes > 0 ? (total / totalMes) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, 'es'));
}

/**
 * @typedef {Object} Filtros
 * @property {string|null} categoriaId  null = todas.
 * @property {string|null} pagadoPor    null = todos; SIN_INDICAR; o un uid.
 */

/**
 * Aplica los filtros de la lista.
 * @param {import('./gastos').Gasto[]} gastos
 * @param {Filtros} filtros
 * @returns {import('./gastos').Gasto[]}
 */
export function filtrarGastos(gastos, { categoriaId, pagadoPor }) {
  return gastos.filter((g) => {
    if (categoriaId && g.categoriaId !== categoriaId) return false;
    if (pagadoPor === SIN_INDICAR) return g.pagadoPor === null;
    if (pagadoPor && g.pagadoPor !== pagadoPor) return false;
    return true;
  });
}

/** ¿Hay algún filtro activo? */
export function hayFiltros({ categoriaId, pagadoPor }) {
  return Boolean(categoriaId || pagadoPor);
}
