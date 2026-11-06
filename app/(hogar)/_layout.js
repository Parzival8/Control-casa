import { Stack } from 'expo-router';

import { useColores } from '../../src/hooks/useColores';

export const unstable_settings = { anchor: 'sin-hogar' };

export default function LayoutHogar() {
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
      <Stack.Screen name="sin-hogar" options={{ headerShown: false }} />
      <Stack.Screen name="crear-hogar" options={{ title: 'Crear hogar' }} />
      <Stack.Screen name="unirse" options={{ title: 'Unirme con código' }} />
    </Stack>
  );
}
