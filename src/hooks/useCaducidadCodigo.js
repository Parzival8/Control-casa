import { useEffect, useState } from 'react';

import { leerCaducidadCodigo } from '../data/hogares';

/**
 * Fecha de caducidad del código de invitación (se consulta al servidor).
 * @param {string|undefined} codigo
 * @returns {{ expiraEn: Date|null, cargando: boolean }}
 */
export function useCaducidadCodigo(codigo) {
  const [estado, setEstado] = useState({ codigo: null, expiraEn: null });

  useEffect(() => {
    if (!codigo) return undefined;
    let activo = true;
    leerCaducidadCodigo(codigo)
      .then((expiraEn) => activo && setEstado({ codigo, expiraEn }))
      .catch(() => activo && setEstado({ codigo, expiraEn: null }));
    return () => {
      activo = false;
    };
  }, [codigo]);

  return {
    expiraEn: estado.codigo === codigo ? estado.expiraEn : null,
    cargando: Boolean(codigo) && estado.codigo !== codigo,
  };
}
