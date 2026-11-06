import {
  ALFABETO_CODIGO,
  esFormatoCodigoValido,
  fechaCaducidadCodigo,
  generarCodigo,
  normalizarCodigo,
} from '../codigoInvitacion';

describe('códigos de invitación', () => {
  test('el alfabeto no tiene caracteres ambiguos', () => {
    for (const ambiguo of ['0', 'O', '1', 'I']) {
      expect(ALFABETO_CODIGO).not.toContain(ambiguo);
    }
  });

  test('genera 8 caracteres válidos', () => {
    for (let i = 0; i < 200; i++) {
      const codigo = generarCodigo();
      expect(codigo).toHaveLength(8);
      expect(esFormatoCodigoValido(codigo)).toBe(true);
    }
  });

  test('cumple el mismo formato que exigen las reglas de Firestore', () => {
    const regla = /^[A-HJ-NP-Z2-9]{8}$/;
    for (let i = 0; i < 200; i++) expect(generarCodigo()).toMatch(regla);
    expect(generarCodigo(() => 0)).toBe('AAAAAAAA');
    expect(generarCodigo(() => 0.9999)).toBe('99999999');
  });

  test('normaliza lo que escribe el usuario', () => {
    expect(normalizarCodigo(' abcd-2345 ')).toBe('ABCD2345');
    expect(normalizarCodigo('abcd 2345')).toBe('ABCD2345');
  });

  test('rechaza formatos incorrectos', () => {
    expect(esFormatoCodigoValido('ABCD234')).toBe(false);
    expect(esFormatoCodigoValido('ABCD2340')).toBe(false); // contiene 0
    expect(esFormatoCodigoValido('ABCDI234')).toBe(false); // contiene I
    expect(esFormatoCodigoValido('')).toBe(false);
  });

  test('caduca a los 7 días', () => {
    const ahora = new Date(2026, 10, 6, 12, 0, 0);
    expect(fechaCaducidadCodigo(ahora).getTime() - ahora.getTime()).toBe(7 * 24 * 3600 * 1000);
  });
});
