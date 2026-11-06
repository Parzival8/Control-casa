import { useEffect, useState } from 'react';

import { escucharHogar } from '../data/hogares';

/**
 * Hogar en tiempo real.
 * @param {string|null} hogarId
 * @returns {{ hogar: import('../data/hogares').Hogar|null, cargando: boolean,
 *             sinAcceso: boolean }}
 *   sinAcceso: el hogar ya no existe o te han quitado de él.
 */
export function useHogar(hogarId) {
  const [estado, setEstado] = useState({ id: null, hogar: null, sinAcceso: false });

  useEffect(() => {
    if (!hogarId) return undefined;
    return escucharHogar(
      hogarId,
      (hogar) => setEstado({ id: hogarId, hogar, sinAcceso: hogar === null }),
      (error) => {
        const denegado = String(error?.code ?? '').includes('permission-denied');
        setEstado((anterior) => ({ ...anterior, id: hogarId, sinAcceso: denegado }));
      },
    );
  }, [hogarId]);

  const actual = estado.id === hogarId;
  return {
    hogar: actual ? estado.hogar : null,
    cargando: Boolean(hogarId) && !actual,
    sinAcceso: actual && estado.sinAcceso,
  };
}
