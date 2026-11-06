import { useEffect, useState } from 'react';

import { escucharHogar } from '../data/hogares';

/** Reintentos antes de concluir que ya no tienes acceso al hogar. */
const REINTENTOS = 3;
const ESPERA_MS = 1500;

/**
 * Hogar en tiempo real.
 *
 * Justo después de crear un hogar o de unirse, el servidor puede tardar un
 * instante en reflejarlo y responder "sin permiso". Por eso un error así se
 * reintenta unas veces antes de decidir que de verdad no tienes acceso.
 *
 * @param {string|null} hogarId
 * @returns {{ hogar: import('../data/hogares').Hogar|null, cargando: boolean,
 *             sinAcceso: boolean }}
 *   sinAcceso: el hogar ya no existe o te han quitado de él.
 */
export function useHogar(hogarId) {
  const [estado, setEstado] = useState({ id: null, hogar: null, sinAcceso: false });
  // Cambiar este número vuelve a suscribirse (un reintento).
  const [intento, setIntento] = useState({ id: null, numero: 0 });
  const numeroIntento = intento.id === hogarId ? intento.numero : 0;

  useEffect(() => {
    if (!hogarId) return undefined;
    let temporizador;
    const dejarDeEscuchar = escucharHogar(
      hogarId,
      (hogar, { desdeCache }) => {
        // "No existe" según la caché del móvil no es definitivo: esperar al servidor.
        if (hogar === null && desdeCache) return;
        setEstado({ id: hogarId, hogar, sinAcceso: hogar === null });
      },
      (error) => {
        const denegado = String(error?.code ?? '').includes('permission-denied');
        if (denegado && numeroIntento < REINTENTOS) {
          temporizador = setTimeout(
            () => setIntento({ id: hogarId, numero: numeroIntento + 1 }),
            ESPERA_MS,
          );
          return;
        }
        setEstado((anterior) => ({ ...anterior, id: hogarId, sinAcceso: denegado }));
      },
    );
    return () => {
      clearTimeout(temporizador);
      dejarDeEscuchar();
    };
  }, [hogarId, numeroIntento]);

  const actual = estado.id === hogarId;
  return {
    hogar: actual ? estado.hogar : null,
    cargando: Boolean(hogarId) && !actual,
    sinAcceso: actual && estado.sinAcceso,
  };
}
