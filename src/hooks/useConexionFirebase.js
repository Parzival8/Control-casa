import { useCallback, useEffect, useState } from 'react';

import { comprobarConexion } from '../data/conexion';

/**
 * Hook que comprueba la conexión con Firebase al montar la pantalla.
 * @returns {{ estado: import('../data/conexion').EstadoConexion | null,
 *             comprobando: boolean, reintentar: () => void }}
 */
export function useConexionFirebase() {
  const [estado, setEstado] = useState(null);
  const [comprobando, setComprobando] = useState(true);

  // Lanza la comprobación y guarda el resultado cuando llega.
  const comprobar = useCallback(() => {
    comprobarConexion()
      .then(setEstado)
      .finally(() => setComprobando(false));
  }, []);

  useEffect(() => {
    comprobar();
  }, [comprobar]);

  const reintentar = useCallback(() => {
    setComprobando(true);
    comprobar();
  }, [comprobar]);

  return { estado, comprobando, reintentar };
}
