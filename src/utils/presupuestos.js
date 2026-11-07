// Presupuestos mensuales por categoría (funciones puras).

/** A partir de este porcentaje se avisa de que el presupuesto se está acabando. */
export const UMBRAL_AVISO = 80;

/**
 * @typedef {Object} EstadoPresupuesto
 * @property {string} categoriaId
 * @property {string} nombre
 * @property {string} icono
 * @property {number} gastado      Céntimos gastados este mes.
 * @property {number} presupuesto  Céntimos.
 * @property {number} porcentaje   gastado / presupuesto * 100 (puede pasar de 100).
 * @property {'bien'|'aviso'|'superado'} nivel
 */

/**
 * Nivel según el porcentaje gastado.
 * @param {number} gastado
 * @param {number} presupuesto
 * @returns {'bien'|'aviso'|'superado'}
 */
export function nivelPresupuesto(gastado, presupuesto) {
  if (gastado > presupuesto) return 'superado';
  if (gastado * 100 >= presupuesto * UMBRAL_AVISO) return 'aviso';
  return 'bien';
}

/**
 * Estado de cada categoría con presupuesto (no archivada) en el mes.
 * Ordenadas: primero las superadas, luego las de aviso, y por porcentaje.
 * @param {import('./gastos').Gasto[]} gastos  Gastos del mes.
 * @param {import('./categoriasIniciales').Categoria[]} categorias
 * @returns {EstadoPresupuesto[]}
 */
export function estadoPresupuestos(gastos, categorias) {
  const gastado = new Map();
  for (const g of gastos) gastado.set(g.categoriaId, (gastado.get(g.categoriaId) ?? 0) + g.importe);
  const orden = { superado: 0, aviso: 1, bien: 2 };

  return categorias
    .filter((c) => !c.archivada && Number.isInteger(c.presupuestoMensual) && c.presupuestoMensual > 0)
    .map((c) => {
      const total = gastado.get(c.id) ?? 0;
      return {
        categoriaId: c.id,
        nombre: c.nombre,
        icono: c.icono,
        gastado: total,
        presupuesto: c.presupuestoMensual,
        porcentaje: (total / c.presupuestoMensual) * 100,
        nivel: nivelPresupuesto(total, c.presupuestoMensual),
      };
    })
    .sort((a, b) => orden[a.nivel] - orden[b.nivel] || b.porcentaje - a.porcentaje);
}
