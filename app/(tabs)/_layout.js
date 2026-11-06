// Pestañas principales. Aquí se escucha el hogar una sola vez para toda la app.
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { Boton } from '../../src/components/Boton';
import { Cargando } from '../../src/components/Cargando';
import { Pantalla } from '../../src/components/Pantalla';
import { Titulo } from '../../src/components/Titulo';
import { olvidarHogar } from '../../src/data/usuarios';
import { useColores } from '../../src/hooks/useColores';
import { useHogar } from '../../src/hooks/useHogar';
import { ProveedorHogar } from '../../src/hooks/useHogarActual';
import { useSesion } from '../../src/hooks/useSesion';

function Icono({ emoji }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function LayoutPestanas() {
  const colores = useColores();
  const { usuario, perfil } = useSesion();
  const { hogar, cargando, sinAcceso } = useHogar(perfil?.hogarId ?? null);

  if (sinAcceso) {
    return (
      <Pantalla centrada>
        <Titulo
          texto="Ya no estás en este hogar"
          subtitulo="El hogar se ha borrado o te han quitado de él. Puedes crear uno nuevo o unirte a otro con un código."
        />
        <Boton titulo="Entendido" onPress={() => olvidarHogar(usuario.uid)} />
      </Pantalla>
    );
  }
  if (cargando || !hogar) return <Cargando />;

  return (
    <ProveedorHogar hogar={hogar}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colores.fondo },
          headerTintColor: colores.texto,
          headerShadowVisible: false,
          tabBarStyle: { backgroundColor: colores.tarjeta, borderTopColor: colores.borde },
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
          name="ajustes"
          options={{ title: 'Ajustes', tabBarIcon: () => <Icono emoji="⚙️" /> }}
        />
      </Tabs>
    </ProveedorHogar>
  );
}
