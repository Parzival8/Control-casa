import {
  fechaGastoFijo,
  idGastoFijo,
  recurrenteIdTrasEditar,
  tocaGenerar,
  validarRecurrente,
} from '../recurrentes';

const fijo = (extra = {}) => ({ activo: true, diaDelMes: 5, ultimoMesGenerado: null, ...extra });

describe('gastos fijos', () => {
  test('id determinista y fecha', () => {
    expect(idGastoFijo('alquiler', '2026-11')).toBe('alquiler_2026-11');
    expect(fechaGastoFijo('2026-11', 5)).toBe('2026-11-05');
  });

  test('toca generar cuando llega su día y aún no se ha apuntado este mes', () => {
    expect(tocaGenerar(fijo(), '2026-11-04')).toBe(false); // aún no es el día
    expect(tocaGenerar(fijo(), '2026-11-05')).toBe(true);
    expect(tocaGenerar(fijo(), '2026-11-30')).toBe(true);
    expect(tocaGenerar(fijo({ ultimoMesGenerado: '2026-11' }), '2026-11-20')).toBe(false); // ya apuntado
    expect(tocaGenerar(fijo({ ultimoMesGenerado: '2026-10' }), '2026-11-20')).toBe(true);
    expect(tocaGenerar(fijo({ ultimoMesGenerado: '2026-12' }), '2027-01-05')).toBe(true); // cambio de año
    expect(tocaGenerar(fijo({ activo: false }), '2026-11-20')).toBe(false); // pausado
  });

  test('validación', () => {
    const bueno = { importe: 70000, categoriaId: 'hipoteca', diaDelMes: 1, nota: '' };
    expect(validarRecurrente(bueno)).toBeNull();
    expect(validarRecurrente({ ...bueno, importe: null })).toMatch(/importe/);
    expect(validarRecurrente({ ...bueno, categoriaId: null })).toMatch(/categoría/);
    expect(validarRecurrente({ ...bueno, diaDelMes: 29 })).toMatch(/entre 1 y 28/);
    expect(validarRecurrente({ ...bueno, diaDelMes: 0 })).toMatch(/entre 1 y 28/);
  });
});

describe('editar un gasto generado por un fijo', () => {
  test('mismo mes: sigue ligado; otro mes: se desvincula', () => {
    expect(recurrenteIdTrasEditar('alquiler_2026-11', 'alquiler', '2026-11-20')).toBe('alquiler');
    expect(recurrenteIdTrasEditar('alquiler_2026-11', 'alquiler', '2026-12-01')).toBeNull();
    expect(recurrenteIdTrasEditar('abc', null, '2026-11-01')).toBeNull();
  });
});
