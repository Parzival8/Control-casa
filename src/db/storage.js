// Interfaz única de acceso a datos. Las vistas SOLO importan de aquí.
// Para cambiar a otro sistema (p. ej. sincronización en la nube), basta con
// cambiar la implementación que se re-exporta abajo.
import * as implementacion from './indexeddb.js';

export const getGastosDelMes = implementacion.getGastosDelMes;
export const updateGasto = implementacion.updateGasto;
export const deleteGasto = implementacion.deleteGasto;
export const getCategorias = implementacion.getCategorias;

// Crea un gasto completo (id y fecha de creación incluidos) y lo guarda.
export function addGasto({ importe, categoriaId, fecha, nota = '', pagadoPor = '' }) {
  return implementacion.addGasto({
    id: crypto.randomUUID(),
    importe, // céntimos (entero)
    categoriaId,
    fecha, // YYYY-MM-DD
    nota,
    pagadoPor,
    recurrenteId: null,
    creadoEn: new Date().toISOString(),
  });
}
