import { Stack } from 'expo-router';

import { useColores } from '../../src/hooks/useColores';

export const unstable_settings = { anchor: 'iniciar-sesion' };

export default function LayoutAcceso() {
  const colores = useColores();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="iniciar-sesion" options={{ headerShown: false }} />
      <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
      <Stack.Screen name="recuperar" options={{ title: 'Recuperar contraseña' }} />
    </Stack>
  );
}
