import { useEffect, useState } from 'react';

/**
 * Hook genérico para cualquier escucha en tiempo real de src/data.
 * @template T
 * @param {string|null} clave  Cambia cuando hay que volver a escuchar (null = no escuchar).
 * @param {(alCambiar: (valor: T) => void, alFallar: (e: Error) => void) => () => void} escuchar
 * @param {T} inicial
 * @returns {{ valor: T, cargando: boolean, error: Error|null }}
 */
export function useEscucha(clave, escuchar, inicial) {
  const [estado, setEstado] = useState({ clave: null, valor: inicial, error: null });

  useEffect(() => {
    if (!clave) return undefined;
    return escuchar(
      (valor) => setEstado({ clave, valor, error: null }),
      (error) => setEstado((anterior) => ({ ...anterior, clave, error })),
    );
    // `escuchar` cambia en cada render; solo importa la clave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const actual = estado.clave === clave;
  return {
    valor: actual ? estado.valor : inicial,
    cargando: Boolean(clave) && !actual,
    error: actual ? estado.error : null,
  };
}
