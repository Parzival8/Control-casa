import { colorAvatar, inicial, ordenarGastos, totalCentimos, validarGasto } from '../gastos';

const g = (id, fecha, importe, creadoEn = null) => ({ id, fecha, importe, creadoEn });

describe('cálculos de gastos', () => {
  test('el total suma en céntimos sin errores de coma flotante', () => {
    // 0,10 + 0,20 en euros daría 0,30000000000000004; en céntimos es exacto.
    expect(totalCentimos([g('a', '2026-11-01', 10), g('b', '2026-11-01', 20)])).toBe(30);
    expect(totalCentimos([])).toBe(0);
    const muchos = Array.from({ length: 1000 }, (_, i) => g(String(i), '2026-11-01', 1999));
    expect(totalCentimos(muchos)).toBe(1999000);
  });

  test('ordena por fecha y, el mismo día, por hora de creación', () => {
    const lista = [
      g('viejo', '2026-11-01', 1, new Date(2026, 10, 1, 9)),
      g('tarde', '2026-11-05', 1, new Date(2026, 10, 5, 20)),
      g('manana', '2026-11-05', 1, new Date(2026, 10, 5, 8)),
      g('pendiente', '2026-11-05', 1, null),
    ];
    expect(ordenarGastos(lista).map((x) => x.id)).toEqual(['pendiente', 'tarde', 'manana', 'viejo']);
    expect(lista[0].id).toBe('viejo'); // no modifica la original
  });

  test('inicial y color de avatar', () => {
    expect(inicial('ana')).toBe('A');
    expect(inicial('  Íñigo')).toBe('Í');
    expect(inicial('')).toBe('?');
    expect(colorAvatar('abc')).toBe(colorAvatar('abc'));
    expect(colorAvatar('abc')).toMatch(/^#[0-9a-f]{6}$/);
  });

  test('validación del gasto', () => {
    const bueno = { importe: 1250, categoriaId: 'luz', fecha: '2026-11-06', nota: '' };
    expect(validarGasto(bueno)).toBeNull();
    expect(validarGasto({ ...bueno, importe: null })).toMatch(/importe/);
    expect(validarGasto({ ...bueno, importe: 0 })).toMatch(/importe/);
    expect(validarGasto({ ...bueno, importe: 12.5 })).toMatch(/importe/);
    expect(validarGasto({ ...bueno, categoriaId: null })).toMatch(/categoría/);
    expect(validarGasto({ ...bueno, fecha: '6/11/2026' })).toMatch(/fecha/);
    expect(validarGasto({ ...bueno, nota: 'x'.repeat(201) })).toMatch(/200/);
  });
});
