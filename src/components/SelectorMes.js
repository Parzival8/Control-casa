// "‹  noviembre de 2026  ›" para cambiar de mes.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { nombreMes } from '../utils/formato';
import { sumarMeses } from '../utils/meses';

function Flecha({ texto, etiqueta, onPress }) {
  const colores = useColores();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={8}
      style={({ pressed }) => [estilos.flecha, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={[estilos.textoFlecha, { color: colores.primario }]}>{texto}</Text>
    </Pressable>
  );
}

export function SelectorMes({ mes, onCambiar }) {
  const colores = useColores();
  const nombre = nombreMes(mes);
  return (
    <View style={estilos.fila}>
      <Flecha texto="‹" etiqueta="Mes anterior" onPress={() => onCambiar(sumarMeses(mes, -1))} />
      <Text accessibilityRole="header" style={[estilos.mes, { color: colores.texto }]}>
        {nombre[0].toUpperCase() + nombre.slice(1)}
      </Text>
      <Flecha texto="›" etiqueta="Mes siguiente" onPress={() => onCambiar(sumarMeses(mes, 1))} />
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flecha: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  textoFlecha: { fontSize: 34, fontWeight: '600', lineHeight: 38 },
  mes: { fontSize: 20, fontWeight: '600' },
});
