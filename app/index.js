// Pantalla de entrada ("/"): no muestra nada, solo envía a cada uno a su sitio.
// Es necesaria porque al abrir la app se carga "/" y, sin ella, una persona
// sin sesión llegaría a una ruta protegida y vería "pantalla no encontrada".
import { Redirect } from 'expo-router';

import { useSesion } from '../src/hooks/useSesion';

export default function Entrada() {
  const { usuario, perfil } = useSesion();
  if (!usuario) return <Redirect href="/iniciar-sesion" />;
  if (!perfil?.hogarId) return <Redirect href="/sin-hogar" />;
  return <Redirect href="/inicio" />;
}
