import { useCallback, useEffect, useState } from 'react';

import { escucharHogar } from '../data/hogares';

/** Reintentos automáticos antes de concluir que ya no tienes acceso al hogar. */
const REINTENTOS = 5;
const ESPERA_MS = 2000;

const SIN_DATOS = { clave: null, hogar: null, sinAcceso: false, motivo: null };

/**
 * Hogar en tiempo real.
 *
 * Justo después de crear un hogar o de unirse, el servidor puede tardar un
 * instante en reflejarlo y responder "sin permiso". Por eso un error así se
 * reintenta unas veces antes de decidir que de verdad no tienes acceso.
 *
 * @param {string|null} hogarId
 * @returns {{ hogar: import('../data/hogares').Hogar|null, cargando: boolean,
 *             sinAcceso: boolean, motivo: string|null, reintentar: () => void }}
 *   sinAcceso: el hogar ya no existe o te han quitado de él.
 *   motivo: detalle técnico del último error (para diagnosticar).
 *   reintentar: vuelve a empezar (botón "Reintentar").
 */
export function useHogar(hogarId) {
  // Cada "ronda" es una tanda de intentos; el botón Reintentar empieza otra.
  const [ronda, setRonda] = useState(0);
  // Número de intento dentro de la ronda actual (0 = el primero).
  const [intento, setIntento] = useState({ clave: null, numero: 0 });
  const [estado, setEstado] = useState(SIN_DATOS);

  // Identifica la escucha actual: si cambia el hogar o la ronda, se empieza de cero.
  const clave = hogarId ? `${hogarId}#${ronda}` : null;
  const numero = intento.clave === clave ? intento.numero : 0;

  useEffect(() => {
    if (!clave) return undefined;
    let temporizador;
    const dejarDeEscuchar = escucharHogar(
      hogarId,
      (hogar, { desdeCache }) => {
        // "No existe" según la caché del móvil no es definitivo: esperar al servidor.
        if (hogar === null && desdeCache) return;
        setEstado({
          clave,
          hogar,
          sinAcceso: hogar === null,
          motivo: hogar === null ? 'el hogar no existe' : null,
        });
      },
      (error) => {
        const denegado = String(error?.code ?? '').includes('permission-denied');
        if (denegado && numero < REINTENTOS) {
          temporizador = setTimeout(() => setIntento({ clave, numero: numero + 1 }), ESPERA_MS);
          return;
        }
        setEstado({
          clave,
          hogar: null,
          sinAcceso: true,
          motivo: String(error?.code ?? error?.message ?? 'error desconocido'),
        });
      },
    );
    return () => {
      clearTimeout(temporizador);
      dejarDeEscuchar();
    };
  }, [clave, hogarId, numero]);

  const reintentar = useCallback(() => setRonda((r) => r + 1), []);

  const actual = estado.clave === clave;
  return {
    hogar: actual ? estado.hogar : null,
    cargando: Boolean(hogarId) && !actual,
    sinAcceso: actual && estado.sinAcceso,
    motivo: actual ? estado.motivo : null,
    reintentar,
  };
}
