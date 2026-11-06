// Pantalla provisional de la Fase 0: confirma que la app arranca y que
// llega a Firebase. En la Fase 1 se sustituye por el flujo de acceso.
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColores } from '../src/hooks/useColores';
import { useConexionFirebase } from '../src/hooks/useConexionFirebase';

export default function Inicio() {
  const colores = useColores();
  const { estado, comprobando, reintentar } = useConexionFirebase();

  return (
    <SafeAreaView style={[estilos.pantalla, { backgroundColor: colores.fondo }]}>
      <Text accessibilityRole="header" style={[estilos.titulo, { color: colores.texto }]}>
        🏠 Control Casa
      </Text>
      <Text style={[estilos.subtitulo, { color: colores.textoSuave }]}>
        Los gastos del hogar, compartidos.
      </Text>

      <View
        style={[estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}
        accessibilityLiveRegion="polite"
      >
        {comprobando ? (
          <View style={estilos.fila}>
            <ActivityIndicator color={colores.primario} />
            <Text style={[estilos.estado, { color: colores.texto }]}>
              Comprobando la conexión con Firebase…
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={[estilos.estado, { color: estado?.ok ? colores.ok : colores.error }]}
            >
              {estado?.ok ? '✅ ' : '⚠️ '}
              {estado?.mensaje}
            </Text>
            {estado?.proyecto ? (
              <Text style={[estilos.detalle, { color: colores.textoSuave }]}>
                Proyecto: {estado.proyecto}
              </Text>
            ) : null}
          </>
        )}
      </View>

      {!comprobando && !estado?.ok ? (
        <Pressable
          onPress={reintentar}
          accessibilityRole="button"
          style={({ pressed }) => [
            estilos.boton,
            { backgroundColor: colores.primario, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[estilos.textoBoton, { color: colores.textoSobrePrimario }]}>
            Reintentar
          </Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  titulo: { fontSize: 34, fontWeight: '700', textAlign: 'center' },
  subtitulo: { fontSize: 17, textAlign: 'center' },
  tarjeta: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 8, marginTop: 16 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  estado: { fontSize: 17, flexShrink: 1 },
  detalle: { fontSize: 14 },
  boton: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  textoBoton: { fontSize: 18, fontWeight: '600' },
});
