import { COLORES, validarCategoria } from '../validacionCategoria';

const otras = [{ id: 'luz', nombre: 'Luz' }];
const buena = { nombre: 'Mascotas', icono: '🐶', color: '#22c55e', presupuestoMensual: null };

describe('validar categoría', () => {
  test('correcta', () => {
    expect(validarCategoria(buena, otras)).toBeNull();
    expect(validarCategoria({ ...buena, presupuestoMensual: 5000 }, otras)).toBeNull();
  });

  test('errores', () => {
    expect(validarCategoria({ ...buena, nombre: '  ' }, otras)).toMatch(/nombre/);
    expect(validarCategoria({ ...buena, nombre: 'luz' }, otras)).toMatch(/Ya hay/);
    expect(validarCategoria({ ...buena, icono: '' }, otras)).toMatch(/icono/);
    expect(validarCategoria({ ...buena, color: 'verde' }, otras)).toMatch(/color/);
    expect(validarCategoria({ ...buena, presupuestoMensual: 0 }, otras)).toMatch(/presupuesto/);
  });

  test('los colores cumplen el formato de las reglas', () => {
    for (const c of COLORES) expect(c).toMatch(/^#[0-9a-f]{6}$/);
  });
});
