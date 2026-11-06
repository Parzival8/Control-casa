// Opciones y validación del formulario de categorías.

/** Iconos sugeridos (también se puede escribir cualquier emoji). */
export const ICONOS = [
  '🏠', '💡', '🚰', '⛽', '📶', '🏢', '🛒', '🍽️', '🚗', '⚕️', '🎬', '👕',
  '🔧', '🛡️', '📦', '🐶', '👶', '🎓', '💊', '🏋️', '✈️', '🎁', '☕', '🍺',
  '📱', '💻', '🧹', '🧺', '🪴', '🚌', '🅿️', '💈', '🎮', '📚', '🏦', '💳',
];

/** Colores disponibles (contraste suficiente en tema claro y oscuro). */
export const COLORES = [
  '#2563eb', '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16',
  '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#8b5cf6',
  '#64748b', '#78716c',
];

/**
 * @param {{ nombre: string, icono: string, color: string, presupuestoMensual: number|null }} datos
 * @param {{ id: string, nombre: string }[]} otras  Las demás categorías del hogar.
 * @returns {string|null} Mensaje de error o null.
 */
export function validarCategoria({ nombre, icono, color, presupuestoMensual }, otras) {
  const limpio = String(nombre ?? '').trim();
  if (!limpio) return 'Escribe un nombre.';
  if (limpio.length > 40) return 'El nombre no puede tener más de 40 caracteres.';
  const repetida = otras.some(
    (c) => c.nombre.trim().toLocaleLowerCase('es') === limpio.toLocaleLowerCase('es'),
  );
  if (repetida) return 'Ya hay una categoría con ese nombre.';
  if (!icono || String(icono).length > 16) return 'Elige un icono.';
  if (!/^#[0-9a-fA-F]{6}$/.test(color ?? '')) return 'Elige un color.';
  if (presupuestoMensual !== null && !(Number.isInteger(presupuestoMensual) && presupuestoMensual > 0)) {
    return 'El presupuesto debe ser un importe mayor que cero, o dejarlo vacío.';
  }
  return null;
}
