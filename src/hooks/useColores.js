import { useColorScheme } from 'react-native';

import { temas } from '../components/colores';

/** Devuelve la paleta del tema actual del sistema (claro u oscuro). */
export function useColores() {
  return useColorScheme() === 'dark' ? temas.oscuro : temas.claro;
}
