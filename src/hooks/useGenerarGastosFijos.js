import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { generarGastosFijos } from '../data/recurrentes';
import { fechaAISO } from '../utils/formato';

/**
 * Apunta los gastos fijos que tocan al abrir la app y cada vez que vuelve a
 * primer plano (por si se dejó abierta de un día para otro).
 * @param {{ hogarId: string|null, uid: string|null, miembros: string[] }} p
 */
export function useGenerarGastosFijos({ hogarId, uid, miembros }) {
  // Los miembros se leen en el momento de generar, sin reiniciar el efecto.
  const miembrosActuales = useRef(miembros);
  useEffect(() => {
    miembrosActuales.current = miembros;
  }, [miembros]);

  useEffect(() => {
    if (!hogarId || !uid) return undefined;
    let enMarcha = false;

    const generar = () => {
      if (enMarcha) return;
      enMarcha = true;
      generarGastosFijos({
        hogarId,
        uid,
        miembros: miembrosActuales.current,
        hoy: fechaAISO(),
      })
        .catch(() => {}) // sin conexión: se intentará la próxima vez
        .finally(() => {
          enMarcha = false;
        });
    };

    generar();
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') generar();
    });
    return () => suscripcion.remove();
  }, [hogarId, uid]);
}
