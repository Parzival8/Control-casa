import { fechaPorDefecto, rangoDelMes, sumarMeses } from '../meses';

describe('meses', () => {
  test('sumar y restar meses, cruzando años', () => {
    expect(sumarMeses('2026-11', 1)).toBe('2026-12');
    expect(sumarMeses('2026-12', 1)).toBe('2027-01');
    expect(sumarMeses('2026-01', -1)).toBe('2025-12');
    expect(sumarMeses('2026-03', -14)).toBe('2025-01');
  });

  test('rango del mes para consultar (comparación de texto)', () => {
    const { desde, hasta } = rangoDelMes('2026-02');
    expect(desde).toBe('2026-02-01');
    expect(hasta).toBe('2026-02-31');
    // Incluye todos los días del mes y ninguno de otros meses.
    expect('2026-02-28' >= desde && '2026-02-28' <= hasta).toBe(true);
    expect('2026-03-01' <= hasta).toBe(false);
    expect('2026-01-31' >= desde).toBe(false);
  });

  test('fecha por defecto al apuntar', () => {
    expect(fechaPorDefecto('2026-11', '2026-11-06')).toBe('2026-11-06');
    expect(fechaPorDefecto('2026-10', '2026-11-06')).toBe('2026-10-01');
  });
});
