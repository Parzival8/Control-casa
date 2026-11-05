// Lista de gastos del mes: icono de categoría, nota, fecha e importe.
import { formatearFecha, formatearImporte } from '../utils/formato.js';

export function crearListaGastos(gastos, categorias) {
  const lista = document.createElement('ul');
  lista.className = 'lista-gastos';

  if (gastos.length === 0) {
    const vacio = document.createElement('li');
    vacio.className = 'vacio';
    vacio.textContent = 'Todavía no hay gastos este mes. Pulsa + para añadir el primero.';
    lista.append(vacio);
    return lista;
  }

  const porId = new Map(categorias.map((c) => [c.id, c]));

  for (const gasto of gastos) {
    const categoria = porId.get(gasto.categoriaId);
    const fila = document.createElement('li');
    fila.className = 'gasto';

    const icono = document.createElement('span');
    icono.className = 'gasto-icono';
    icono.textContent = categoria?.icono ?? '📦';
    icono.style.background = `${categoria?.color ?? '#94a3b8'}22`;

    const texto = document.createElement('div');
    texto.className = 'gasto-texto';
    const titulo = document.createElement('strong');
    titulo.textContent = gasto.nota || categoria?.nombre || 'Gasto';
    const detalle = document.createElement('small');
    detalle.textContent = `${categoria?.nombre ?? ''} · ${formatearFecha(gasto.fecha)}`;
    texto.append(titulo, detalle);

    const importe = document.createElement('span');
    importe.className = 'gasto-importe';
    importe.textContent = formatearImporte(gasto.importe);

    fila.append(icono, texto, importe);
    lista.append(fila);
  }
  return lista;
}
