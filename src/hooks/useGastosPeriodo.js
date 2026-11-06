import { escucharGastosEntre } from '../data/gastos';
import { useEscucha } from './useEscucha';

const SIN_GASTOS = [];

/**
 * Gastos de varios meses seguidos, en tiempo real.
 * @param {string} hogarId
 * @param {string} desdeMes "YYYY-MM"
 * @param {string} hastaMes "YYYY-MM"
 */
export function useGastosPeriodo(hogarId, desdeMes, hastaMes) {
  const { valor, cargando, error } = useEscucha(
    hogarId ? `${hogarId}/${desdeMes}/${hastaMes}` : null,
    (alCambiar, alFallar) => escucharGastosEntre(hogarId, desdeMes, hastaMes, alCambiar, alFallar),
    SIN_GASTOS,
  );
  return { gastos: valor, cargando, error };
}
