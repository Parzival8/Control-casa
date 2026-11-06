// Círculo con la inicial de un miembro (siempre del mismo color para cada uno).
import { StyleSheet, Text, View } from 'react-native';

import { colorAvatar, inicial } from '../utils/gastos';

export function Avatar({ uid, nombre, tamano = 28 }) {
  return (
    <View
      accessibilityLabel={`Pagado por ${nombre}`}
      style={[
        estilos.circulo,
        { width: tamano, height: tamano, borderRadius: tamano / 2, backgroundColor: colorAvatar(uid) },
      ]}
    >
      <Text style={[estilos.letra, { fontSize: tamano * 0.5 }]}>{inicial(nombre)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: { alignItems: 'center', justifyContent: 'center' },
  letra: { color: '#ffffff', fontWeight: '700' },
});
