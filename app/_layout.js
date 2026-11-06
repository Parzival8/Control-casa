// Layout raíz: decide qué parte de la app se ve según la sesión.
//   sin sesión            -> (auth): iniciar sesión, registro, recuperar
//   con sesión, sin hogar -> (hogar): crear hogar o unirse con código
//   con sesión y hogar    -> (tabs): la app
// Stack.Protected impide abrir pantallas de otro grupo; cuando cambia la
// situación (p. ej. al cerrar sesión) vuelve a app/index.js, que redirige.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Cargando } from '../src/components/Cargando';
import { useColores } from '../src/hooks/useColores';
import { ProveedorSesion, useSesion } from '../src/hooks/useSesion';

export default function LayoutRaiz() {
  return (
    <ProveedorSesion>
      <StatusBar style="auto" />
      <Navegacion />
    </ProveedorSesion>
  );
}

function Navegacion() {
  const { usuario, perfil, cargando } = useSesion();
  const colores = useColores();

  if (cargando) return <Cargando />;

  const conSesion = Boolean(usuario);
  const conHogar = Boolean(perfil?.hogarId);

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colores.fondo } }}
    >
      {/* Sin protección: es la que redirige (ver app/index.js). */}
      <Stack.Screen name="index" />
      <Stack.Protected guard={!conSesion}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={conSesion && !conHogar}>
        <Stack.Screen name="(hogar)" />
      </Stack.Protected>
      <Stack.Protected guard={conSesion && conHogar}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
