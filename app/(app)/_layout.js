// Parte de la app para quien ya tiene hogar. Escucha el hogar y sus categorías
// una sola vez y los comparte con todas las pantallas (pestañas y formularios).
import { Stack } from 'expo-router';
import { Text } from 'react-native';

import { Boton } from '../../src/components/Boton';
import { Cargando } from '../../src/components/Cargando';
import { Pantalla } from '../../src/components/Pantalla';
import { Titulo } from '../../src/components/Titulo';
import { Version } from '../../src/components/Version';
import { olvidarHogar } from '../../src/data/usuarios';
import { useCategoriasHogar } from '../../src/hooks/useCategoriasHogar';
import { useColores } from '../../src/hooks/useColores';
import { useHogar } from '../../src/hooks/useHogar';
import { ProveedorHogar } from '../../src/hooks/useHogarActual';
import { useSesion } from '../../src/hooks/useSesion';

export default function LayoutApp() {
  const colores = useColores();
  const { usuario, perfil } = useSesion();
  const hogarId = perfil?.hogarId ?? null;
  const { hogar, cargando, sinAcceso, motivo, reintentar } = useHogar(hogarId);
  const { categorias } = useCategoriasHogar(hogar ? hogarId : null);

  if (sinAcceso) {
    return (
      <Pantalla centrada>
        <Titulo
          texto="No se puede abrir el hogar"
          subtitulo="Puede que el hogar se haya borrado o que te hayan quitado de él. Si acabas de crearlo o de unirte, prueba a reintentar."
        />
        <Boton titulo="Reintentar" onPress={reintentar} />
        <Boton
          titulo="Dejar este hogar y empezar de nuevo"
          variante="secundario"
          onPress={() => olvidarHogar(usuario.uid)}
        />
        {/* Detalle técnico para poder diagnosticar el problema. */}
        <Text style={{ color: colores.textoSuave, fontSize: 13, textAlign: 'center' }}>
          Detalle: {motivo}
        </Text>
        <Version />
      </Pantalla>
    );
  }
  if (cargando || !hogar) return <Cargando />;

  return (
    <ProveedorHogar hogar={hogar} categorias={categorias}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.fondo },
          headerTintColor: colores.texto,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gasto/nuevo" options={{ title: 'Nuevo gasto' }} />
        <Stack.Screen name="gasto/[id]" options={{ title: 'Editar gasto' }} />
        <Stack.Screen name="categoria/nueva" options={{ title: 'Nueva categoría' }} />
        <Stack.Screen name="categoria/[id]" options={{ title: 'Editar categoría' }} />
      </Stack>
    </ProveedorHogar>
  );
}
