import {
  esEmailValido,
  validarInicioSesion,
  validarNombre,
  validarRegistro,
} from '../validacion';

const registroBueno = {
  nombre: 'Ana',
  email: 'ana@ejemplo.com',
  contrasena: 'secreta1',
  repetida: 'secreta1',
};

describe('validaciones', () => {
  test('emails', () => {
    expect(esEmailValido('ana@ejemplo.com')).toBe(true);
    expect(esEmailValido(' ana@ejemplo.com ')).toBe(true);
    expect(esEmailValido('ana@ejemplo')).toBe(false);
    expect(esEmailValido('ana ejemplo.com')).toBe(false);
  });

  test('nombres', () => {
    expect(validarNombre('Casa', 40)).toBeNull();
    expect(validarNombre('   ', 40)).toBe('Escribe un nombre.');
    expect(validarNombre('x'.repeat(41), 40)).toMatch(/40 caracteres/);
  });

  test('inicio de sesión', () => {
    expect(validarInicioSesion({ email: 'ana@ejemplo.com', contrasena: 'x' })).toBeNull();
    expect(validarInicioSesion({ email: 'mal', contrasena: 'x' })).toMatch(/email/);
    expect(validarInicioSesion({ email: 'ana@ejemplo.com', contrasena: '' })).toMatch(/contraseña/);
  });

  test('registro', () => {
    expect(validarRegistro(registroBueno)).toBeNull();
    expect(validarRegistro({ ...registroBueno, nombre: '' })).toMatch(/nombre/);
    expect(validarRegistro({ ...registroBueno, contrasena: '123', repetida: '123' })).toMatch(
      /al menos 6/,
    );
    expect(validarRegistro({ ...registroBueno, repetida: 'otra' })).toMatch(/no coinciden/);
  });
});
