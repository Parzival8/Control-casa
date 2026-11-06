// Utilidades de formato: moneda en euros y fechas.
// Son funciones puras (sin Firebase ni React) y están cubiertas por tests.
//
// Nota: el formato de moneda se hace "a mano" en lugar de con Intl.NumberFormat.
// El motor JavaScript de la app (Hermes) no siempre respeta la opción
// `useGrouping: 'always'`, y en es-ES eso hace que 1234 salga sin punto
// ("1234,56 €"). Así el resultado es el mismo en el móvil y en los tests.

const NOMBRES_MES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Formatea un importe en céntimos como euros en formato español.
 * @param {number} centimos Entero, por ejemplo 123456.
 * @returns {string} Por ejemplo "1.234,56 €" (con espacio duro antes de €).
 */
export function formatearImporte(centimos) {
  const signo = centimos < 0 ? '-' : '';
  const absoluto = Math.abs(Math.round(centimos));
  const euros = Math.floor(absoluto / 100);
  const resto = String(absoluto % 100).padStart(2, '0');
  // Inserta un punto cada tres cifras empezando por la derecha.
  const eurosConPuntos = String(euros).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${signo}${eurosConPuntos},${resto} €`;
}

/**
 * Convierte lo que escribe el usuario a céntimos.
 * Acepta "12,50", "12.5", "1.234,56" o "1234". La coma es el separador decimal;
 * si solo hay un punto seguido de 1 o 2 cifras, se toma como decimal.
 * @param {string} texto
 * @returns {number|null} Céntimos (entero > 0) o null si no es válido.
 */
export function textoACentimos(texto) {
  let limpio = String(texto ?? '').trim().replace(/\s|€/g, '');
  if (!limpio) return null;
  if (limpio.includes(',')) {
    // Formato español: los puntos son de miles.
    limpio = limpio.replace(/\./g, '').replace(',', '.');
  } else if (!/^\d+\.\d{1,2}$/.test(limpio)) {
    // Sin coma: un punto con 3 cifras detrás es de miles ("1.234").
    limpio = limpio.replace(/\./g, '');
  }
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
  const centimos = Math.round(Number(limpio) * 100);
  return centimos > 0 ? centimos : null;
}

/**
 * Fecha a texto "YYYY-MM-DD" en hora local (no UTC), que es como se guarda.
 * @param {Date} [fecha]
 * @returns {string}
 */
export function fechaAISO(fecha = new Date()) {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

/**
 * "2026-11-06" -> "06/11/2026"
 * @param {string} iso
 * @returns {string}
 */
export function formatearFecha(iso) {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/**
 * "2026-11" -> "noviembre de 2026"
 * @param {string} mes Mes en formato "YYYY-MM".
 * @returns {string}
 */
export function nombreMes(mes) {
  const [a, m] = mes.split('-').map(Number);
  return `${NOMBRES_MES[m - 1]} de ${a}`;
}

/**
 * Mes actual como "YYYY-MM".
 * @param {Date} [hoy]
 * @returns {string}
 */
export function mesActual(hoy = new Date()) {
  return fechaAISO(hoy).slice(0, 7);
}
