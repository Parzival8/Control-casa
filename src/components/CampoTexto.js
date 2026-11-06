// Campo de texto con etiqueta visible (también para lectores de pantalla).
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useColores } from '../hooks/useColores';

export function CampoTexto({ etiqueta, style, ...props }) {
  const colores = useColores();
  return (
    <View style={estilos.grupo}>
      <Text style={[estilos.etiqueta, { color: colores.texto }]}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSuave}
        style={[
          estilos.campo,
          { color: colores.texto, borderColor: colores.borde, backgroundColor: colores.tarjeta },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: 6 },
  etiqueta: { fontSize: 16, fontWeight: '600' },
  campo: { minHeight: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 18 },
});
