import { StyleSheet, Text } from 'react-native';

import { useColores } from '../hooks/useColores';

/** Título y subtítulo de pantalla. */
export function Titulo({ texto, subtitulo }) {
  const colores = useColores();
  return (
    <>
      <Text accessibilityRole="header" style={[estilos.titulo, { color: colores.texto }]}>
        {texto}
      </Text>
      {subtitulo ? (
        <Text style={[estilos.subtitulo, { color: colores.textoSuave }]}>{subtitulo}</Text>
      ) : null}
    </>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 30, fontWeight: '700' },
  subtitulo: { fontSize: 17, lineHeight: 24 },
});
