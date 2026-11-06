// Versión de la app y número de compilación (el del APK de GitHub Releases).
import Constants from 'expo-constants';
import { StyleSheet, Text } from 'react-native';

import { useColores } from '../hooks/useColores';

/** Texto como "Versión 0.1.0 · compilación 12". */
export function textoVersion() {
  const config = Constants.expoConfig ?? {};
  const compilacion = config.extra?.compilacion ?? 'local';
  return `Versión ${config.version ?? '?'} · compilación ${compilacion}`;
}

export function Version() {
  const colores = useColores();
  return <Text style={[estilos.texto, { color: colores.textoSuave }]}>{textoVersion()}</Text>;
}

const estilos = StyleSheet.create({
  texto: { fontSize: 13, textAlign: 'center' },
});
