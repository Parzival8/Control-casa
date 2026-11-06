import { StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';

/** Bloque con fondo y borde, con título opcional. */
export function Tarjeta({ titulo, children }) {
  const colores = useColores();
  return (
    <View style={[estilos.tarjeta, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
      {titulo ? (
        <Text accessibilityRole="header" style={[estilos.titulo, { color: colores.texto }]}>
          {titulo}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 12 },
  titulo: { fontSize: 19, fontWeight: '700' },
});
