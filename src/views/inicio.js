// Pantalla de inicio: total del mes, lista de gastos y botón (+).
import { addGasto, getCategorias, getGastosDelMes } from '../db/storage.js';
import { abrirFormularioGasto } from '../components/formularioGasto.js';
import { crearListaGastos } from '../components/listaGastos.js';
import { formatearImporte, mesActual, nombreMes } from '../utils/formato.js';

export async function mostrarInicio(contenedor) {
  const mes = mesActual();
  contenedor.innerHTML = `
    <header class="cabecera">
      <p class="mes"></p>
      <p class="total-etiqueta">Gastado este mes</p>
      <p class="total"></p>
    </header>
    <main class="contenido"></main>
    <button class="boton-flotante" aria-label="Añadir gasto">+</button>
  `;

  const elMes = contenedor.querySelector('.mes');
  const elTotal = contenedor.querySelector('.total');
  const elContenido = contenedor.querySelector('.contenido');
  elMes.textContent = nombreMes(mes);

  // Vuelve a leer los datos y repinta total y lista.
  async function refrescar() {
    const [gastos, categorias] = await Promise.all([getGastosDelMes(mes), getCategorias()]);
    const totalCentimos = gastos.reduce((suma, g) => suma + g.importe, 0);
    elTotal.textContent = formatearImporte(totalCentimos);
    elContenido.replaceChildren(crearListaGastos(gastos, categorias));
  }

  contenedor.querySelector('.boton-flotante').addEventListener('click', async () => {
    const categorias = await getCategorias();
    abrirFormularioGasto({
      categorias,
      alGuardar: async (datos) => {
        await addGasto(datos);
        await refrescar();
      },
    });
  });

  await refrescar();
}
