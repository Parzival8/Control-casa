// Punto de entrada. En la fase 1 solo hay una pantalla (Inicio);
// el router se ampliará cuando haya más vistas.
import './styles/main.css';
import { mostrarInicio } from './views/inicio.js';

mostrarInicio(document.getElementById('app'));
