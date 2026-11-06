import { compararConAnterior, mediaMensual, mesCorto, totalesPorMes, ultimosMeses } from '../estadisticas';

describe('estadísticas', () => {
  test('últimos 12 meses, cruzando el año', () => {
    const meses = ultimosMeses('2026-03');
    expect(meses).toHaveLength(12);
    expect(meses[0]).toBe('2025-04');
    expect(meses[11]).toBe('2026-03');
  });

  test('totales por mes, con ceros y sin contar meses de fuera', () => {
    const gastos = [
      { fecha: '2026-02-10', importe: 100 },
      { fecha: '2026-02-28', importe: 50 },
      { fecha: '2026-03-01', importe: 7 },
      { fecha: '2025-01-01', importe: 999 },
    ];
    expect(totalesPorMes(gastos, ['2026-01', '2026-02', '2026-03'])).toEqual([
      { mes: '2026-01', total: 0 },
      { mes: '2026-02', total: 150 },
      { mes: '2026-03', total: 7 },
    ]);
  });

  test('comparación con el mes anterior', () => {
    expect(compararConAnterior(12000, 10000)).toEqual({ diferencia: 2000, porcentaje: 20 });
    expect(compararConAnterior(9000, 10000)).toEqual({ diferencia: -1000, porcentaje: -10 });
    expect(compararConAnterior(5000, 0)).toEqual({ diferencia: 5000, porcentaje: null });
    expect(compararConAnterior(1, 3).porcentaje).toBe(-66.7);
  });

  test('media mensual de los meses con gasto', () => {
    expect(mediaMensual([{ total: 0 }, { total: 100 }, { total: 201 }])).toBe(151);
    expect(mediaMensual([{ total: 0 }])).toBe(0);
  });

  test('nombre corto del mes', () => {
    expect(mesCorto('2026-01')).toBe('ene');
    expect(mesCorto('2026-12')).toBe('dic');
  });
});
