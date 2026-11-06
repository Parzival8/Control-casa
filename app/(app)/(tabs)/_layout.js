// Pestañas principales.
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColores } from '../../../src/hooks/useColores';
import { useHogarActual } from '../../../src/hooks/useHogarActual';

// Icono de pestaña con un emoji. La altura de línea fija evita que el emoji
// (más alto que un icono normal) empuje el texto de la pestaña hacia abajo.
function Icono({ emoji }) {
  return <Text style={{ fontSize: 20, lineHeight: 24, height: 24 }}>{emoji}</Text>;
}

/** Alto de la barra de pestañas sin contar los botones de Android. */
const ALTO_BARRA = 64;

export default function LayoutPestanas() {
  const colores = useColores();
  const hogar = useHogarActual();
  // Espacio que ocupan los botones de Android (atrás, inicio…) bajo la app.
  const { bottom: margenInferior } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colores.tarjeta,
          borderTopColor: colores.borde,
          height: ALTO_BARRA + margenInferior,
          paddingTop: 6,
          paddingBottom: margenInferior + 8,
        },
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarLabelStyle: { fontSize: 13 },
        sceneStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: hogar.nombre,
          tabBarLabel: 'Inicio',
          tabBarIcon: () => <Icono emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="categorias"
        options={{ title: 'Categorías', tabBarIcon: () => <Icono emoji="🏷️" /> }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{ title: 'Ajustes', tabBarIcon: () => <Icono emoji="⚙️" /> }}
      />
    </Tabs>
  );
}
