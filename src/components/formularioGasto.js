// Hoja inferior para añadir un gasto: importe, categoría, fecha y nota.
import { fechaAISO, textoACentimos } from '../utils/formato.js';

// Abre el formulario. `alGuardar` recibe los datos validados del gasto.
export function abrirFormularioGasto({ categorias, alGuardar }) {
  const activas = categorias.filter((c) => !c.archivada);
  let categoriaId = null;

  const fondo = document.createElement('div');
  fondo.className = 'fondo-hoja';

  const hoja = document.createElement('form');
  hoja.className = 'hoja';
  hoja.noValidate = true;
  hoja.innerHTML = `
    <h2>Nuevo gasto</h2>
    <label class="campo">
      <span>Importe (€)</span>
      <input name="importe" type="text" inputmode="decimal" autocomplete="off"
             placeholder="0,00" class="campo-importe" />
    </label>
    <div class="campo">
      <span>Categoría</span>
      <div class="cuadricula-categorias"></div>
    </div>
    <label class="campo">
      <span>Fecha</span>
      <input name="fecha" type="date" />
    </label>
    <label class="campo">
      <span>Nota (opcional)</span>
      <input name="nota" type="text" autocomplete="off" placeholder="Ej.: compra semanal" />
    </label>
    <p class="error" role="alert" hidden></p>
    <div class="acciones">
      <button type="button" class="boton secundario" data-accion="cancelar">Cancelar</button>
      <button type="submit" class="boton">Guardar</button>
    </div>
  `;

  const inputImporte = hoja.elements.importe;
  const inputFecha = hoja.elements.fecha;
  const inputNota = hoja.elements.nota;
  const error = hoja.querySelector('.error');
  const cuadricula = hoja.querySelector('.cuadricula-categorias');
  inputFecha.value = fechaAISO();

  // Botones de categoría (selección única)
  for (const categoria of activas) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'categoria-opcion';
    boton.innerHTML = `<span>${categoria.icono}</span><small>${categoria.nombre}</small>`;
    boton.addEventListener('click', () => {
      categoriaId = categoria.id;
      for (const b of cuadricula.children) b.classList.remove('seleccionada');
      boton.classList.add('seleccionada');
      error.hidden = true;
    });
    cuadricula.append(boton);
  }

  function cerrar() {
    fondo.remove();
  }

  function mostrarError(mensaje) {
    error.textContent = mensaje;
    error.hidden = false;
  }

  hoja.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const importe = textoACentimos(inputImporte.value);
    if (importe === null) return mostrarError('Escribe un importe mayor que 0.');
    if (!categoriaId) return mostrarError('Elige una categoría.');
    if (!inputFecha.value) return mostrarError('Elige una fecha.');
    await alGuardar({
      importe,
      categoriaId,
      fecha: inputFecha.value,
      nota: inputNota.value.trim(),
    });
    cerrar();
  });

  hoja.querySelector('[data-accion="cancelar"]').addEventListener('click', cerrar);
  fondo.addEventListener('click', (e) => {
    if (e.target === fondo) cerrar();
  });

  fondo.append(hoja);
  document.body.append(fondo);
  inputImporte.focus();
}
