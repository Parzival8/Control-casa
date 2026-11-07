// Exportar gastos a un archivo CSV y abrir el menú de compartir del móvil.

import { collection, getDocs, getFirestore } from '@react-native-firebase/firestore';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Lee TODOS los gastos del hogar (solo para exportar; la app nunca los carga
 * todos para mostrarlos).
 * @param {string} hogarId
 * @returns {Promise<import('../utils/gastos').Gasto[]>}
 */
export async function leerTodosLosGastos(hogarId) {
  const instantanea = await getDocs(collection(getFirestore(), 'hogares', hogarId, 'gastos'));
  return instantanea.docs.map((d) => {
    const datos = d.data();
    return {
      id: d.id,
      importe: datos.importe,
      categoriaId: datos.categoriaId,
      fecha: datos.fecha,
      nota: datos.nota ?? '',
      pagadoPor: datos.pagadoPor ?? null,
      creadoPor: datos.creadoPor,
      editadoPor: datos.editadoPor,
      recurrenteId: datos.recurrenteId ?? null,
      creadoEn: datos.creadoEn ? datos.creadoEn.toDate() : null,
    };
  });
}

/**
 * Guarda el texto en un archivo temporal y abre "Compartir" (WhatsApp, email,
 * Drive…). El archivo va en la caché: el sistema lo borra cuando necesita sitio.
 * @param {string} nombreArchivo
 * @param {string} contenido Texto del CSV (con BOM).
 */
export async function compartirCSV(nombreArchivo, contenido) {
  const archivo = new File(Paths.cache, nombreArchivo);
  if (archivo.exists) archivo.delete();
  archivo.create();
  await archivo.write(contenido);
  await Sharing.shareAsync(archivo.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Compartir gastos',
    UTI: 'public.comma-separated-values-text',
  });
}
