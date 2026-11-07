import { estadoPresupuestos, nivelPresupuesto } from '../presupuestos';

describe('presupuestos', () => {
  test('niveles: aviso desde el 80 %, superado al pasar del 100 %', () => {
    expect(nivelPresupuesto(7999, 10000)).toBe('bien');
    expect(nivelPresupuesto(8000, 10000)).toBe('aviso');
    expect(nivelPresupuesto(10000, 10000)).toBe('aviso'); // justo en el límite
    expect(nivelPresupuesto(10001, 10000)).toBe('superado');
  });

  test('solo categorías con presupuesto y no archivadas, las más urgentes primero', () => {
    const categorias = [
      { id: 'luz', nombre: 'Luz', icono: '💡', presupuestoMensual: 5000, archivada: false },
      { id: 'super', nombre: 'Súper', icono: '🛒', presupuestoMensual: 30000, archivada: false },
      { id: 'ocio', nombre: 'Ocio', icono: '🎬', presupuestoMensual: null, archivada: false },
      { id: 'vieja', nombre: 'Vieja', icono: '📦', presupuestoMensual: 1000, archivada: true },
      { id: 'gas', nombre: 'Gas', icono: '⛽', presupuestoMensual: 4000, archivada: false },
    ];
    const gastos = [
      { categoriaId: 'luz', importe: 6000 },
      { categoriaId: 'super', importe: 25000 },
      { categoriaId: 'ocio', importe: 999 },
    ];
    const estado = estadoPresupuestos(gastos, categorias);
    expect(estado.map((e) => [e.categoriaId, e.nivel, e.gastado])).toEqual([
      ['luz', 'superado', 6000],
      ['super', 'aviso', 25000],
      ['gas', 'bien', 0],
    ]);
    expect(estado[0].porcentaje).toBe(120);
  });
});
