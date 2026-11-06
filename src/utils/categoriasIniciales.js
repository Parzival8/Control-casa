// Categorías que se crean en cada hogar nuevo (ver ESPECIFICACION.md, sección 4).

/**
 * @typedef {Object} Categoria
 * @property {string} id                  Identificador estable (también id del documento).
 * @property {string} nombre
 * @property {string} icono               Emoji.
 * @property {string} color               Color en hexadecimal, p. ej. "#2563eb".
 * @property {number|null} presupuestoMensual  En céntimos, o null si no tiene.
 * @property {boolean} archivada
 */

/** @type {Categoria[]} */
export const categoriasIniciales = [
  { id: 'hipoteca', nombre: 'Hipoteca/Alquiler', icono: '🏠', color: '#2563eb' },
  { id: 'luz', nombre: 'Luz', icono: '💡', color: '#f59e0b' },
  { id: 'agua', nombre: 'Agua', icono: '🚰', color: '#06b6d4' },
  { id: 'gas', nombre: 'Gas', icono: '⛽', color: '#ef4444' },
  { id: 'internet', nombre: 'Internet y móvil', icono: '📶', color: '#8b5cf6' },
  { id: 'comunidad', nombre: 'Comunidad', icono: '🏢', color: '#64748b' },
  { id: 'supermercado', nombre: 'Supermercado', icono: '🛒', color: '#22c55e' },
  { id: 'restaurantes', nombre: 'Restaurantes', icono: '🍽️', color: '#f97316' },
  { id: 'transporte', nombre: 'Transporte', icono: '🚗', color: '#0ea5e9' },
  { id: 'salud', nombre: 'Salud', icono: '⚕️', color: '#ec4899' },
  { id: 'ocio', nombre: 'Ocio', icono: '🎬', color: '#a855f7' },
  { id: 'ropa', nombre: 'Ropa', icono: '👕', color: '#14b8a6' },
  { id: 'hogar', nombre: 'Hogar y reformas', icono: '🔧', color: '#78716c' },
  { id: 'seguros', nombre: 'Seguros', icono: '🛡️', color: '#475569' },
  { id: 'otros', nombre: 'Otros', icono: '📦', color: '#94a3b8' },
].map((c) => ({ ...c, presupuestoMensual: null, archivada: false }));
