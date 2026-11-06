import { categoriasIniciales } from '../categoriasIniciales';

describe('categoriasIniciales', () => {
  test('son las 15 de la especificación', () => {
    expect(categoriasIniciales).toHaveLength(15);
  });
  test('ids únicos y campos completos', () => {
    const ids = new Set(categoriasIniciales.map((c) => c.id));
    expect(ids.size).toBe(categoriasIniciales.length);
    for (const c of categoriasIniciales) {
      expect(c.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(c.presupuestoMensual).toBeNull();
      expect(c.archivada).toBe(false);
    }
  });
});
