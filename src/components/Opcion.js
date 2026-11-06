// Botón seleccionable (para elegir categoría, quién pagó, etc.).
import { Pressable, StyleSheet, Text } from 'react-native';

import { useColores } from '../hooks/useColores';

export function Opcion({ texto, seleccionada, onPress, ancho, icono }) {
  const colores = useColores();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: seleccionada, checked: seleccionada }}
      accessibilityLabel={texto}
      style={({ pressed }) => [
        estilos.opcion,
        ancho ? { width: ancho } : null,
        {
          borderColor: seleccionada ? colores.primario : colores.borde,
          backgroundColor: seleccionada ? `${colores.primario}22` : colores.tarjeta,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {icono ? <Text style={estilos.icono}>{icono}</Text> : null}
      <Text
        numberOfLines={2}
        style={[
          estilos.texto,
          { color: colores.texto, fontWeight: seleccionada ? '700' : '400' },
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  opcion: {
    minHeight: 48,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icono: { fontSize: 24 },
  texto: { fontSize: 14, textAlign: 'center' },
});
