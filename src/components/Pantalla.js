// Contenedor de pantalla: márgenes seguros, scroll y teclado que no tapa los campos.
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColores } from '../hooks/useColores';

export function Pantalla({ children, centrada = false, bordes = ['top', 'bottom'] }) {
  const colores = useColores();
  return (
    <SafeAreaView edges={bordes} style={[estilos.zona, { backgroundColor: colores.fondo }]}>
      <KeyboardAvoidingView
        style={estilos.zona}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[estilos.contenido, centrada && estilos.centrada]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  zona: { flex: 1 },
  contenido: { flexGrow: 1, padding: 24, gap: 16 },
  centrada: { justifyContent: 'center' },
});
