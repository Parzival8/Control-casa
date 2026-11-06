// Gráfico de donut con el gasto del mes por categoría, y su leyenda.
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { useColores } from '../hooks/useColores';
import { formatearImporte } from '../utils/formato';

/**
 * @param {{ lineas: import('../utils/resumen').LineaResumen[], total: number }} props
 */
export function GraficoCategorias({ lineas, total }) {
  const colores = useColores();
  const datos = lineas.map((l) => ({ value: l.total, color: l.color }));

  return (
    <View style={estilos.contenedor}>
      <View
        accessible
        accessibilityLabel={`Gráfico de gasto por categoría. Total ${formatearImporte(total)}.`}
        style={estilos.grafico}
      >
        <PieChart
          data={datos}
          donut
          radius={110}
          innerRadius={72}
          innerCircleColor={colores.tarjeta}
          strokeWidth={2}
          strokeColor={colores.tarjeta}
          centerLabelComponent={() => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colores.textoSuave, fontSize: 13 }}>Total</Text>
              <Text style={{ color: colores.texto, fontSize: 18, fontWeight: '800' }}>
                {formatearImporte(total)}
              </Text>
            </View>
          )}
        />
      </View>
      <View style={estilos.leyenda}>
        {lineas.map((l) => (
          <View
            key={l.categoriaId}
            style={estilos.fila}
            accessible
            accessibilityLabel={`${l.nombre}: ${formatearImporte(l.total)}, ${Math.round(l.porcentaje)} por ciento`}
          >
            <View style={[estilos.punto, { backgroundColor: l.color }]} />
            <Text numberOfLines={1} style={[estilos.nombre, { color: colores.texto }]}>
              {l.icono} {l.nombre}
            </Text>
            <Text style={{ color: colores.textoSuave, fontSize: 14 }}>{Math.round(l.porcentaje)} %</Text>
            <Text style={[estilos.importe, { color: colores.texto }]}>{formatearImporte(l.total)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 16 },
  grafico: { alignItems: 'center' },
  leyenda: { gap: 8 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  punto: { width: 12, height: 12, borderRadius: 6 },
  nombre: { flex: 1, fontSize: 15 },
  importe: { fontSize: 15, fontWeight: '600', minWidth: 90, textAlign: 'right' },
});
