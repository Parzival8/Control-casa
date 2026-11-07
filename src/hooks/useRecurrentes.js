import { escucharRecurrentes } from '../data/recurrentes';
import { useEscucha } from './useEscucha';

const NINGUNO = [];

/** Gastos fijos del hogar en tiempo real. */
export function useRecurrentes(hogarId) {
  const { valor, cargando, error } = useEscucha(
    hogarId,
    (alCambiar, alFallar) => escucharRecurrentes(hogarId, alCambiar, alFallar),
    NINGUNO,
  );
  return { recurrentes: valor, cargando, error };
}
