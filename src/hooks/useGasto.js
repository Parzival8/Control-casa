import { escucharGasto } from '../data/gastos';
import { useEscucha } from './useEscucha';

/**
 * Un gasto concreto en tiempo real (para la pantalla de edición).
 * @param {string} hogarId
 * @param {string} gastoId
 * @returns {{ gasto: import('../utils/gastos').Gasto|null, cargando: boolean }}
 *   gasto null si no existe (p. ej. lo acaba de borrar otro miembro).
 */
export function useGasto(hogarId, gastoId) {
  const { valor, cargando } = useEscucha(
    hogarId && gastoId ? `${hogarId}/${gastoId}` : null,
    (alCambiar, alFallar) => escucharGasto(hogarId, gastoId, alCambiar, alFallar),
    null,
  );
  return { gasto: valor, cargando };
}
