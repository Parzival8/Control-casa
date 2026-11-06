import { ERRORES_APP, crearError, mensajeDeError } from '../errores';

describe('mensajes de error', () => {
  test('traduce errores de Firebase', () => {
    expect(mensajeDeError({ code: 'auth/invalid-credential' })).toBe(
      'El email o la contraseña no son correctos.',
    );
    expect(mensajeDeError({ code: 'auth/email-already-in-use' })).toMatch(/Ya existe una cuenta/);
    expect(mensajeDeError({ code: 'auth/network-request-failed' })).toMatch(/conexión/);
  });

  test('los errores propios llevan su mensaje', () => {
    const error = crearError(ERRORES_APP.CODIGO_CADUCADO);
    expect(error.code).toBe('app/codigo-caducado');
    expect(mensajeDeError(error)).toMatch(/caducado/);
  });

  test('cualquier otro error da un mensaje genérico en español', () => {
    expect(mensajeDeError(new Error('boom'))).toBe(
      'Ha ocurrido un error inesperado. Vuelve a intentarlo.',
    );
    expect(mensajeDeError(undefined)).toMatch(/error inesperado/);
  });
});
