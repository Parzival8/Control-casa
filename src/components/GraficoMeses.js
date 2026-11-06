// Barras con el total de los últimos 12 meses. El mes elegido se resalta.
import { useWindowDimensions, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { useColores } from '../hooks/useColores';
import { mesCorto } from '../utils/estadisticas';
import { formatearImporte } from '../utils/formato';

/**
 * @param {{ totales: { mes: string, total: number }[], mesElegido: string }} props
 */
export function GraficoMeses({ totales, mesElegido }) {
  const colores = useColores();
  const { width } = useWindowDimensions();

  // Que quepan los 12 meses en pantallas pequeñas (360 px) sin desplazarse.
  const anchoGrafico = width - 32 - 36 - 50; // márgenes, tarjeta y eje Y
  const espacio = 6;
  const anchoBarra = Math.max(10, Math.floor((anchoGrafico - espacio * 13) / 12));

  const datos = totales.map(({ mes, total }) => ({
    // El gráfico trabaja en euros (solo para dibujar); los textos usan céntimos.
    value: total / 100,
    label: mesCorto(mes),
    frontColor: mes === mesElegido ? colores.primario : `${colores.primario}66`,
  }));

  const descripcion = totales.map((t) => `${mesCorto(t.mes)}: ${formatearImporte(t.total)}`).join(', ');

  return (
    <View accessible accessibilityLabel={`Gasto de los últimos 12 meses. ${descripcion}`}>
      <BarChart
        data={datos}
        width={anchoGrafico}
        height={180}
        barWidth={anchoBarra}
        spacing={espacio}
        initialSpacing={espacio}
        noOfSections={4}
        disableScroll
        isAnimated
        barBorderTopLeftRadius={4}
        barBorderTopRightRadius={4}
        yAxisThickness={0}
        xAxisColor={colores.borde}
        rulesColor={colores.borde}
        yAxisTextStyle={{ color: colores.textoSuave, fontSize: 11 }}
        xAxisLabelTextStyle={{ color: colores.textoSuave, fontSize: 10 }}
        labelWidth={anchoBarra + espacio}
        formatYLabel={(valor) => {
          const euros = Math.round(Number(valor));
          return euros >= 1000 ? `${Math.round(euros / 100) / 10}k` : String(euros);
        }}
      />
    </View>
  );
}
