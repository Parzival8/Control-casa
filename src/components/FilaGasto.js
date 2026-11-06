// Una fila de la lista de gastos: icono, nota o categoría, fecha, importe y quién pagó.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { formatearFecha, formatearImporte } from '../utils/formato';
import { Avatar } from './Avatar';

/**
 * @param {{ gasto: import('../utils/gastos').Gasto,
 *           categoria: import('../utils/categoriasIniciales').Categoria|undefined,
 *           nombrePagador: string|null, onPress: () => void }} props
 */
export function FilaGasto({ gasto, categoria, nombrePagador, onPress }) {
  const colores = useColores();
  const nombreCategoria = categoria?.nombre ?? 'Sin categoría';
  const titulo = gasto.nota || nombreCategoria;
  const importe = formatearImporte(gasto.importe);
  const fecha = formatearFecha(gasto.fecha);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ${importe}, ${fecha}${nombrePagador ? `, pagado por ${nombrePagador}` : ''}. Toca para editar.`}
      style={({ pressed }) => [
        estilos.fila,
        { backgroundColor: colores.tarjeta, borderColor: colores.borde, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[estilos.icono, { backgroundColor: `${categoria?.color ?? '#94a3b8'}33` }]}>
        <Text style={estilos.emoji}>{categoria?.icono ?? '📦'}</Text>
      </View>
      <View style={estilos.centro}>
        <Text numberOfLines={1} style={[estilos.titulo, { color: colores.texto }]}>
          {titulo}
        </Text>
        <Text numberOfLines={1} style={[estilos.detalle, { color: colores.textoSuave }]}>
          {fecha}
          {gasto.nota ? ` · ${nombreCategoria}` : ''}
        </Text>
      </View>
      <Text style={[estilos.importe, { color: colores.texto }]}>{importe}</Text>
      {nombrePagador ? <Avatar uid={gasto.pagadoPor} nombre={nombrePagador} /> : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  icono: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  centro: { flex: 1, gap: 2 },
  titulo: { fontSize: 17, fontWeight: '500' },
  detalle: { fontSize: 14 },
  importe: { fontSize: 17, fontWeight: '700' },
});
