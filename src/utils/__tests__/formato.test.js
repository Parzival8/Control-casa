import {
  fechaAISO,
  formatearFecha,
  formatearImporte,
  mesActual,
  nombreMes,
  textoACentimos,
} from '../formato';

// Espacio duro (U+00A0) que se usa entre el número y el símbolo €.
const NBSP = ' ';

describe('formatearImporte', () => {
  test('usa punto de miles y coma decimal', () => {
    expect(formatearImporte(123456)).toBe(`1.234,56${NBSP}€`);
  });
  test('pone punto también con 4 cifras', () => {
    expect(formatearImporte(100000)).toBe(`1.000,00${NBSP}€`);
  });
  test('importes pequeños y cero', () => {
    expect(formatearImporte(5)).toBe(`0,05${NBSP}€`);
    expect(formatearImporte(0)).toBe(`0,00${NBSP}€`);
  });
  test('millones', () => {
    expect(formatearImporte(123456789)).toBe(`1.234.567,89${NBSP}€`);
  });
  test('negativos (para diferencias del reparto)', () => {
    expect(formatearImporte(-2550)).toBe(`-25,50${NBSP}€`);
  });
});

describe('textoACentimos', () => {
  test.each([
    ['12,50', 1250],
    ['12,5', 1250],
    ['12.5', 1250],
    ['12.50', 1250],
    ['1.234,56', 123456],
    ['1.234', 123400],
    ['1234', 123400],
    [' 7 ', 700],
    ['0,10', 10],
    ['19,99 €', 1999],
  ])('"%s" -> %i céntimos', (texto, esperado) => {
    expect(textoACentimos(texto)).toBe(esperado);
  });

  test.each(['', 'abc', '0', '0,00', '-5', '1,234', '12,5,0', null, undefined])(
    '"%s" no es válido',
    (texto) => {
      expect(textoACentimos(texto)).toBeNull();
    },
  );

  test('no arrastra errores de coma flotante', () => {
    expect(textoACentimos('0,29')).toBe(29);
    expect(textoACentimos('1,15')).toBe(115);
  });
});

describe('fechas', () => {
  test('fechaAISO usa la hora local y rellena con ceros', () => {
    expect(fechaAISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  test('formatearFecha pasa a dd/mm/aaaa', () => {
    expect(formatearFecha('2026-11-06')).toBe('06/11/2026');
  });
  test('nombreMes', () => {
    expect(nombreMes('2026-11')).toBe('noviembre de 2026');
    expect(nombreMes('2027-01')).toBe('enero de 2027');
  });
  test('mesActual', () => {
    expect(mesActual(new Date(2026, 11, 31))).toBe('2026-12');
  });
});

describe('centimosATexto e isoAFecha', () => {
  test('céntimos a texto editable (ida y vuelta)', () => {
    const { centimosATexto, textoACentimos } = require('../formato');
    expect(centimosATexto(123456)).toBe('1234,56');
    expect(centimosATexto(5)).toBe('0,05');
    expect(centimosATexto(null)).toBe('');
    for (const c of [1, 99, 100, 1250, 123456, 99999999]) {
      expect(textoACentimos(centimosATexto(c))).toBe(c);
    }
  });

  test('isoAFecha conserva el día', () => {
    const { fechaAISO, isoAFecha } = require('../formato');
    expect(fechaAISO(isoAFecha('2026-03-29'))).toBe('2026-03-29');
    expect(fechaAISO(isoAFecha('2026-12-31'))).toBe('2026-12-31');
  });
});
