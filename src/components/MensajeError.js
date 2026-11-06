// Caja de error visible y anunciada por los lectores de pantalla.
import { StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';

export function MensajeError({ mensaje }) {
  const colores = useColores();
  if (!mensaje) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[estilos.caja, { backgroundColor: colores.fondoError }]}
    >
      <Text style={[estilos.texto, { color: colores.error }]}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { borderRadius: 12, padding: 14 },
  texto: { fontSize: 16 },
});
