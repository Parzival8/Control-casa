import { useMemo } from 'react';

import { escucharGastosDelMes } from '../data/gastos';
import { ordenarGastos, totalCentimos } from '../utils/gastos';
import { useEscucha } from './useEscucha';

const SIN_GASTOS = [];

/**
 * Gastos de un mes en tiempo real, ordenados (más recientes primero) y su total.
 * @param {string} hogarId
 * @param {string} mes "YYYY-MM"
 */
export function useGastosDelMes(hogarId, mes) {
  const { valor, cargando, error } = useEscucha(
    hogarId ? `${hogarId}/${mes}` : null,
    (alCambiar, alFallar) => escucharGastosDelMes(hogarId, mes, alCambiar, alFallar),
    SIN_GASTOS,
  );
  const gastos = useMemo(() => ordenarGastos(valor), [valor]);
  return { gastos, total: totalCentimos(gastos), cargando, error };
}
