// Reparto del gasto del mes entre los miembros (resumen informativo de
// "quién debe a quién"; la app no gestiona pagos). Funciones puras.
//
// Decisión del usuario (Fase 4): los gastos con "Pagado por" = "Sin indicar"
// NO cuentan en el reparto; se informa aparte de cuánto suman. Tampoco cuentan
// los pagados por alguien que ya no está en el hogar.

/**
 * @typedef {Object} LineaReparto
 * @property {string} uid
 * @property {string} nombre
 * @property {number} pagado   Céntimos que ha pagado en el mes.
 * @property {number} parte    Céntimos que le tocarían a partes iguales.
 * @property {number} saldo    pagado - parte. Positivo: le deben; negativo: debe.
 */

/**
 * @typedef {Object} Transferencia
 * @property {string} de       uid de quien debe.
 * @property {string} a        uid de quien recibe.
 * @property {number} importe  Céntimos (> 0).
 */

/**
 * @typedef {Object} Reparto
 * @property {LineaReparto[]} lineas
 * @property {Transferencia[]} transferencias  Pocas transferencias que lo dejan todo a cero.
 * @property {number} totalRepartido  Céntimos de los gastos que cuentan.
 * @property {number} sinIndicar      Céntimos de gastos sin pagador (o de antiguos miembros).
 */

/**
 * Divide un importe en n partes enteras que suman exactamente el total.
 * Los céntimos que sobran se dan, uno a uno, a las primeras partes.
 * Ej.: 1000 entre 3 -> [334, 333, 333].
 * @param {number} total Céntimos.
 * @param {number} n
 * @returns {number[]}
 */
export function dividirEnPartes(total, n) {
  const base = Math.floor(total / n);
  const resto = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < resto ? 1 : 0));
}

/**
 * Calcula el reparto del mes.
 * @param {import('./gastos').Gasto[]} gastos  Gastos del mes.
 * @param {{ uid: string, nombre: string }[]} miembros  Miembros actuales del hogar.
 * @returns {Reparto}
 */
export function calcularReparto(gastos, miembros) {
  // Orden fijo (por uid) para que el céntimo sobrante caiga siempre igual
  // en todos los móviles.
  const ordenados = [...miembros].sort((a, b) => (a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0));
  const esMiembro = new Set(ordenados.map((m) => m.uid));

  const pagado = new Map(ordenados.map((m) => [m.uid, 0]));
  let sinIndicar = 0;
  for (const g of gastos) {
    if (g.pagadoPor && esMiembro.has(g.pagadoPor)) {
      pagado.set(g.pagadoPor, pagado.get(g.pagadoPor) + g.importe);
    } else {
      sinIndicar += g.importe;
    }
  }

  const totalRepartido = [...pagado.values()].reduce((a, b) => a + b, 0);
  const partes = ordenados.length > 0 ? dividirEnPartes(totalRepartido, ordenados.length) : [];

  const lineas = ordenados.map((m, i) => ({
    uid: m.uid,
    nombre: m.nombre,
    pagado: pagado.get(m.uid),
    parte: partes[i],
    saldo: pagado.get(m.uid) - partes[i],
  }));

  return { lineas, transferencias: calcularTransferencias(lineas), totalRepartido, sinIndicar };
}

/**
 * Empareja a quien debe con quien tiene que recibir hasta dejar todos los
 * saldos a cero (como mucho n-1 transferencias).
 * @param {LineaReparto[]} lineas
 * @returns {Transferencia[]}
 */
export function calcularTransferencias(lineas) {
  const deudores = lineas
    .filter((l) => l.saldo < 0)
    .map((l) => ({ uid: l.uid, falta: -l.saldo }))
    .sort((a, b) => b.falta - a.falta);
  const acreedores = lineas
    .filter((l) => l.saldo > 0)
    .map((l) => ({ uid: l.uid, falta: l.saldo }))
    .sort((a, b) => b.falta - a.falta);

  const transferencias = [];
  let i = 0;
  let j = 0;
  while (i < deudores.length && j < acreedores.length) {
    const importe = Math.min(deudores[i].falta, acreedores[j].falta);
    transferencias.push({ de: deudores[i].uid, a: acreedores[j].uid, importe });
    deudores[i].falta -= importe;
    acreedores[j].falta -= importe;
    if (deudores[i].falta === 0) i++;
    if (acreedores[j].falta === 0) j++;
  }
  return transferencias;
}

/**
 * Frase para una transferencia, vista desde el usuario actual.
 * - "Miguel debe 12,34 € a Ana"
 * - "Debes 12,34 € a Miguel"
 * - "Miguel te debe 12,34 €"
 * @param {Transferencia} t
 * @param {(uid: string) => string} nombreDe
 * @param {string} uidActual
 * @param {(centimos: number) => string} formatear
 * @returns {string}
 */
export function textoTransferencia(t, nombreDe, uidActual, formatear) {
  const importe = formatear(t.importe);
  if (t.de === uidActual) return `Debes ${importe} a ${nombreDe(t.a)}`;
  if (t.a === uidActual) return `${nombreDe(t.de)} te debe ${importe}`;
  return `${nombreDe(t.de)} debe ${importe} a ${nombreDe(t.a)}`;
}
