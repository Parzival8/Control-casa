// Utilidades de formato: moneda en euros y fechas.

const formatoEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  useGrouping: 'always', // en es-ES los 4 dígitos no llevan punto por defecto
});

// 123456 (céntimos) -> "1234,56 €"
export function formatearImporte(centimos) {
  return formatoEuros.format(centimos / 100);
}

// "12,50" o "12.5" -> 1250 (céntimos). Devuelve null si no es válido.
export function textoACentimos(texto) {
  const limpio = String(texto).trim().replace(/\./g, '').replace(',', '.');
  const numero = Number(limpio);
  if (!limpio || Number.isNaN(numero) || numero <= 0) return null;
  return Math.round(numero * 100);
}

// Date -> "YYYY-MM-DD" (en hora local, no UTC)
export function fechaAISO(fecha = new Date()) {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

// "2026-11-06" -> "06/11/2026"
export function formatearFecha(iso) {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

// "2026-11" -> "noviembre de 2026"
export function nombreMes(mes) {
  const [a, m] = mes.split('-').map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
}

// Mes actual como "YYYY-MM"
export function mesActual() {
  return fechaAISO().slice(0, 7);
}
