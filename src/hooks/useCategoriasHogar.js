import { escucharCategorias } from '../data/categorias';
import { useEscucha } from './useEscucha';

const SIN_CATEGORIAS = [];

/** Categorías del hogar en tiempo real (se usa una vez, en el layout de la app). */
export function useCategoriasHogar(hogarId) {
  const { valor, cargando } = useEscucha(
    hogarId,
    (alCambiar, alFallar) => escucharCategorias(hogarId, alCambiar, alFallar),
    SIN_CATEGORIAS,
  );
  return { categorias: valor, cargando };
}
