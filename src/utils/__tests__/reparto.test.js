import { calcularReparto, calcularTransferencias, dividirEnPartes } from '../reparto';

const g = (importe, pagadoPor) => ({ importe, pagadoPor });
const miembros = (n) =>
  ['ana', 'blas', 'carla', 'dani'].slice(0, n).map((uid) => ({ uid, nombre: uid }));
const suma = (xs) => xs.reduce((a, b) => a + b, 0);

describe('dividir en partes', () => {
  test('cuadra al céntimo', () => {
    expect(dividirEnPartes(1000, 3)).toEqual([334, 333, 333]);
    expect(dividirEnPartes(1001, 4)).toEqual([251, 250, 250, 250]);
    expect(dividirEnPartes(1, 2)).toEqual([1, 0]);
    for (let total = 0; total < 500; total++) {
      for (const n of [1, 2, 3, 4, 7]) expect(suma(dividirEnPartes(total, n))).toBe(total);
    }
  });
});

describe('reparto del mes', () => {
  test('dos personas: quien pagó menos debe la mitad de la diferencia', () => {
    const r = calcularReparto([g(10000, 'ana'), g(4000, 'blas')], miembros(2));
    expect(r.lineas.map((l) => [l.uid, l.pagado, l.parte, l.saldo])).toEqual([
      ['ana', 10000, 7000, 3000],
      ['blas', 4000, 7000, -3000],
    ]);
    expect(r.transferencias).toEqual([{ de: 'blas', a: 'ana', importe: 3000 }]);
  });

  test.each([2, 3, 4])('con %i miembros los saldos suman exactamente cero', (n) => {
    // Importes "feos" para forzar céntimos sobrantes.
    const gastos = [g(1001, 'ana'), g(333, 'blas'), g(7, 'ana'), g(12345, n > 2 ? 'carla' : 'blas')];
    if (n === 4) gastos.push(g(999, 'dani'));
    const r = calcularReparto(gastos, miembros(n));
    expect(suma(r.lineas.map((l) => l.saldo))).toBe(0);
    expect(suma(r.lineas.map((l) => l.parte))).toBe(r.totalRepartido);
    expect(suma(r.lineas.map((l) => l.pagado))).toBe(r.totalRepartido);
    // Tras las transferencias, nadie debe nada.
    const saldos = new Map(r.lineas.map((l) => [l.uid, l.saldo]));
    for (const t of r.transferencias) {
      saldos.set(t.de, saldos.get(t.de) + t.importe);
      saldos.set(t.a, saldos.get(t.a) - t.importe);
    }
    expect([...saldos.values()].every((s) => s === 0)).toBe(true);
    expect(r.transferencias.length).toBeLessThanOrEqual(n - 1);
  });

  test('"Sin indicar" y antiguos miembros no cuentan, pero se informan', () => {
    const r = calcularReparto([g(5000, 'ana'), g(1234, null), g(766, 'antiguo')], miembros(2));
    expect(r.totalRepartido).toBe(5000);
    expect(r.sinIndicar).toBe(2000);
    expect(r.transferencias).toEqual([{ de: 'blas', a: 'ana', importe: 2500 }]);
  });

  test('sin gastos o todos pagados igual: nadie debe nada', () => {
    expect(calcularReparto([], miembros(3)).transferencias).toEqual([]);
    expect(calcularReparto([g(100, 'ana'), g(100, 'blas')], miembros(2)).transferencias).toEqual([]);
  });

  test('el céntimo sobrante cae siempre en el mismo miembro', () => {
    const a = calcularReparto([g(1001, 'blas')], [{ uid: 'blas', nombre: 'B' }, { uid: 'ana', nombre: 'A' }]);
    const b = calcularReparto([g(1001, 'blas')], [{ uid: 'ana', nombre: 'A' }, { uid: 'blas', nombre: 'B' }]);
    expect(a).toEqual(b);
  });

  test('transferencias con varios acreedores', () => {
    const t = calcularTransferencias([
      { uid: 'a', saldo: 600 },
      { uid: 'b', saldo: 300 },
      { uid: 'c', saldo: -900 },
    ]);
    expect(t).toEqual([
      { de: 'c', a: 'a', importe: 600 },
      { de: 'c', a: 'b', importe: 300 },
    ]);
  });
});

describe('frases de las transferencias', () => {
  const { textoTransferencia } = require('../reparto');
  const nombres = { ana: 'Ana', blas: 'Blas', carla: 'Carla' };
  const de = (uid) => nombres[uid];
  const fmt = (c) => `${c / 100} €`;
  const t = { de: 'blas', a: 'ana', importe: 1234 };

  test('desde fuera, si debes y si te deben', () => {
    expect(textoTransferencia(t, de, 'carla', fmt)).toBe('Blas debe 12.34 € a Ana');
    expect(textoTransferencia(t, de, 'blas', fmt)).toBe('Debes 12.34 € a Ana');
    expect(textoTransferencia(t, de, 'ana', fmt)).toBe('Blas te debe 12.34 €');
  });
});
