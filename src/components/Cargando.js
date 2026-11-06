import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useColores } from '../hooks/useColores';

/** Pantalla de espera a pantalla completa. */
export function Cargando() {
  const colores = useColores();
  return (
    <View
      style={[estilos.zona, { backgroundColor: colores.fondo }]}
      accessibilityLabel="Cargando"
    >
      <ActivityIndicator size="large" color={colores.primario} />
    </View>
  );
}

const estilos = StyleSheet.create({
  zona: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
