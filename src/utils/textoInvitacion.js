import { fechaAISO, formatearFecha } from './formato';

/**
 * Mensaje que se comparte (WhatsApp, etc.) para invitar a alguien al hogar.
 * @param {{ nombreHogar: string, codigo: string, expiraEn: Date|null }} datos
 * @returns {string}
 */
export function textoInvitacion({ nombreHogar, codigo, expiraEn }) {
  const caducidad = expiraEn ? ` Vale hasta el ${formatearFecha(fechaAISO(expiraEn))}.` : '';
  return (
    `¡Te invito a nuestro hogar «${nombreHogar}» en Control Casa para llevar juntos los gastos de casa! ` +
    `Abre la app, elige «Unirme con código» y escribe: ${codigo}.${caducidad}`
  );
}

/**
 * Lista de miembros para mostrar, en el orden en que se unieron.
 * @param {import('../data/hogares').Hogar} hogar
 * @param {string} uidActual
 * @returns {{ uid: string, nombre: string, esTu: boolean, esCreador: boolean }[]}
 */
export function listaMiembros(hogar, uidActual) {
  return hogar.miembros.map((uid) => ({
    uid,
    nombre: hogar.miembrosInfo?.[uid]?.nombre ?? 'Sin nombre',
    esTu: uid === uidActual,
    esCreador: uid === hogar.creadoPor,
  }));
}
