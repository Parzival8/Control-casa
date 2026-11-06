// Botón grande (mínimo 52 px de alto) para usar cómodamente con una mano.
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useColores } from '../hooks/useColores';

/**
 * @param {{ titulo: string, onPress: () => void, variante?: 'primario'|'secundario'|'enlace',
 *           cargando?: boolean, desactivado?: boolean }} props
 */
export function Boton({ titulo, onPress, variante = 'primario', cargando = false, desactivado = false }) {
  const colores = useColores();
  const inactivo = desactivado || cargando;
  const esPrimario = variante === 'primario';
  const esEnlace = variante === 'enlace';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        estilos.base,
        esPrimario && { backgroundColor: colores.primario },
        variante === 'secundario' && { borderWidth: 2, borderColor: colores.primario },
        { opacity: inactivo ? 0.6 : pressed ? 0.8 : 1 },
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={esPrimario ? colores.textoSobrePrimario : colores.primario} />
      ) : (
        <Text
          style={[
            estilos.texto,
            { color: esPrimario ? colores.textoSobrePrimario : colores.primario },
            esEnlace && estilos.textoEnlace,
          ]}
        >
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  textoEnlace: { fontSize: 16, fontWeight: '500' },
});
