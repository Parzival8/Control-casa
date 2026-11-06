// Layout raíz de Expo Router: envuelve todas las pantallas.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColores } from '../src/hooks/useColores';

export default function LayoutRaiz() {
  const colores = useColores();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}
      />
    </>
  );
}
