import { SIN_INDICAR, filtrarGastos, hayFiltros, resumenPorCategoria } from '../resumen';
import { totalCentimos } from '../gastos';

const categorias = [
  { id: 'luz', nombre: 'Luz', icono: '💡', color: '#f59e0b' },
  { id: 'super', nombre: 'Supermercado', icono: '🛒', color: '#22c55e' },
];
const g = (id, categoriaId, importe, pagadoPor = null) => ({ id, categoriaId, importe, pagadoPor });

describe('resumen por categoría', () => {
  test('agrupa, ordena de mayor a menor y suma exactamente el total del mes', () => {
    const gastos = [g('1', 'luz', 3333), g('2', 'super', 10001), g('3', 'luz', 3334), g('4', 'borrada', 7)];
    const resumen = resumenPorCategoria(gastos, categorias);
    expect(resumen.map((l) => [l.categoriaId, l.total])).toEqual([
      ['super', 10001],
      ['luz', 6667],
      ['borrada', 7],
    ]);
    expect(resumen.reduce((s, l) => s + l.total, 0)).toBe(totalCentimos(gastos));
    // Una categoría que ya no existe sale como "Sin categoría".
    expect(resumen[2].nombre).toBe('Sin categoría');
  });

  test('los porcentajes suman 100', () => {
    const resumen = resumenPorCategoria([g('1', 'luz', 1), g('2', 'super', 2)], categorias);
    expect(resumen.reduce((s, l) => s + l.porcentaje, 0)).toBeCloseTo(100);
  });

  test('sin gastos no hay líneas', () => {
    expect(resumenPorCategoria([], categorias)).toEqual([]);
  });
});

describe('filtros', () => {
  const gastos = [g('1', 'luz', 100, 'ana'), g('2', 'super', 200, null), g('3', 'luz', 300, 'blas')];

  test('por categoría', () => {
    expect(filtrarGastos(gastos, { categoriaId: 'luz', pagadoPor: null }).map((x) => x.id)).toEqual(['1', '3']);
  });

  test('por quién pagó, incluido "sin indicar"', () => {
    expect(filtrarGastos(gastos, { categoriaId: null, pagadoPor: 'blas' }).map((x) => x.id)).toEqual(['3']);
    expect(filtrarGastos(gastos, { categoriaId: null, pagadoPor: SIN_INDICAR }).map((x) => x.id)).toEqual(['2']);
  });

  test('combinados y sin filtros', () => {
    expect(filtrarGastos(gastos, { categoriaId: 'luz', pagadoPor: 'ana' }).map((x) => x.id)).toEqual(['1']);
    expect(filtrarGastos(gastos, { categoriaId: null, pagadoPor: null })).toHaveLength(3);
    expect(hayFiltros({ categoriaId: null, pagadoPor: null })).toBe(false);
    expect(hayFiltros({ categoriaId: 'luz', pagadoPor: null })).toBe(true);
  });
});
