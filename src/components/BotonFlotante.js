// Botón redondo (+) abajo a la derecha, al alcance del pulgar.
import { Pressable, StyleSheet, Text } from 'react-native';

import { useColores } from '../hooks/useColores';

export function BotonFlotante({ etiqueta, onPress }) {
  const colores = useColores();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ pressed }) => [
        estilos.boton,
        { backgroundColor: colores.primario, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[estilos.mas, { color: colores.textoSobrePrimario }]}>+</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  mas: { fontSize: 36, lineHeight: 40, fontWeight: '400' },
});
