// Implementación del almacenamiento con IndexedDB (librería idb).
// NADIE fuera de src/db/ debe importar este archivo: se usa mediante storage.js.
import { openDB } from 'idb';
import { categoriasIniciales } from '../utils/categoriasIniciales.js';

const NOMBRE_BD = 'gastos-casa';
const VERSION = 1;

let promesaBD = null;

function abrirBD() {
  if (!promesaBD) {
    promesaBD = openDB(NOMBRE_BD, VERSION, {
      upgrade(db) {
        const gastos = db.createObjectStore('gastos', { keyPath: 'id' });
        gastos.createIndex('fecha', 'fecha'); // para buscar por mes
        db.createObjectStore('categorias', { keyPath: 'id' });
      },
    }).then(sembrarCategorias);
  }
  return promesaBD;
}

// Primera ejecución: crea las categorías iniciales.
async function sembrarCategorias(db) {
  const total = await db.count('categorias');
  if (total === 0) {
    const tx = db.transaction('categorias', 'readwrite');
    for (const categoria of categoriasIniciales) tx.store.put(categoria);
    await tx.done;
  }
  return db;
}

export async function getGastosDelMes(mes) {
  // mes = "YYYY-MM". Las fechas ISO se ordenan como texto, así que un rango basta.
  const db = await abrirBD();
  const gastos = await db.getAllFromIndex(
    'gastos',
    'fecha',
    IDBKeyRange.bound(`${mes}-01`, `${mes}-31`)
  );
  // Más recientes primero
  return gastos.sort(
    (a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn.localeCompare(a.creadoEn)
  );
}

export async function addGasto(gasto) {
  const db = await abrirBD();
  await db.add('gastos', gasto);
  return gasto;
}

export async function updateGasto(gasto) {
  const db = await abrirBD();
  await db.put('gastos', gasto);
  return gasto;
}

export async function deleteGasto(id) {
  const db = await abrirBD();
  await db.delete('gastos', id);
}

export async function getCategorias() {
  const db = await abrirBD();
  return db.getAll('categorias');
}
