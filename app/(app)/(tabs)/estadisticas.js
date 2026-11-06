// Estadísticas: gasto por categoría (donut), últimos 12 meses (barras),
// comparación con el mes anterior, gasto medio y reparto entre miembros.
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GraficoCategorias } from '../../../src/components/GraficoCategorias';
import { GraficoMeses } from '../../../src/components/GraficoMeses';
import { MensajeError } from '../../../src/components/MensajeError';
import { Pantalla } from '../../../src/components/Pantalla';
import { SelectorMes } from '../../../src/components/SelectorMes';
import { Tarjeta } from '../../../src/components/Tarjeta';
import { TarjetaReparto } from '../../../src/components/TarjetaReparto';
import { useColores } from '../../../src/hooks/useColores';
import { useGastosPeriodo } from '../../../src/hooks/useGastosPeriodo';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { mensajeDeError } from '../../../src/utils/errores';
import {
  compararConAnterior,
  mediaMensual,
  totalesPorMes,
  ultimosMeses,
} from '../../../src/utils/estadisticas';
import { formatearImporte, mesActual, nombreMes } from '../../../src/utils/formato';
import { calcularReparto } from '../../../src/utils/reparto';
import { resumenPorCategoria } from '../../../src/utils/resumen';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

function Dato({ etiqueta, valor, detalle, colorDetalle }) {
  const colores = useColores();
  return (
    <View style={[estilos.dato, { backgroundColor: colores.tarjeta, borderColor: colores.borde }]}>
      <Text style={{ color: colores.textoSuave, fontSize: 14 }}>{etiqueta}</Text>
      <Text style={{ color: colores.texto, fontSize: 20, fontWeight: '800' }}>{valor}</Text>
      {detalle ? (
        <Text style={{ color: colorDetalle ?? colores.textoSuave, fontSize: 14 }}>{detalle}</Text>
      ) : null}
    </View>
  );
}

export default function Estadisticas() {
  const colores = useColores();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const { usuario } = useSesion();
  const [mes, setMes] = useState(mesActual());

  // Un solo listener para los 12 meses que terminan en el mes elegido.
  const meses = ultimosMeses(mes, 12);
  const { gastos, cargando, error } = useGastosPeriodo(hogar.id, meses[0], mes);

  const totales = totalesPorMes(gastos, meses);
  const total = totales[11].total;
  const anterior = totales[10].total;
  const gastosDelMes = gastos.filter((g) => g.fecha.startsWith(mes));
  const lineas = resumenPorCategoria(gastosDelMes, categorias);
  const comparacion = compararConAnterior(total, anterior);
  const media = mediaMensual(totales);
  const reparto = calcularReparto(
    gastosDelMes,
    listaMiembros(hogar, usuario.uid).map(({ uid, nombre }) => ({ uid, nombre })),
  );

  let detalleComparacion = 'Sin gastos el mes anterior';
  let colorComparacion;
  if (comparacion.porcentaje !== null) {
    const signo = comparacion.diferencia > 0 ? '+' : '';
    detalleComparacion = `${signo}${formatearImporte(comparacion.diferencia)} (${signo}${comparacion.porcentaje.toLocaleString('es-ES')} %)`;
    // Gastar más que el mes anterior se marca en rojo; menos, en verde.
    colorComparacion = comparacion.diferencia > 0 ? colores.error : colores.ok;
  }

  return (
    <Pantalla bordes={[]}>
      <SelectorMes mes={mes} onCambiar={setMes} />
      <MensajeError mensaje={error ? mensajeDeError(error) : null} />

      {cargando ? (
        <ActivityIndicator color={colores.primario} style={{ marginTop: 24 }} />
      ) : (
        <>
          <View style={estilos.datos}>
            <Dato
              etiqueta="Total del mes"
              valor={formatearImporte(total)}
              detalle={`vs. ${nombreMes(meses[10]).split(' ')[0]}: ${detalleComparacion}`}
              colorDetalle={colorComparacion}
            />
            <Dato
              etiqueta="Gasto medio mensual"
              valor={formatearImporte(media)}
              detalle="Meses con gastos del último año"
            />
          </View>

          <Tarjeta titulo="Por categoría">
            {lineas.length > 0 ? (
              <GraficoCategorias lineas={lineas} total={total} />
            ) : (
              <Text style={[estilos.vacio, { color: colores.textoSuave }]}>
                📊 Este mes todavía no hay gastos.{'\n'}Cuando apuntéis alguno, verás aquí en qué se
                va el dinero.
              </Text>
            )}
          </Tarjeta>

          <Tarjeta titulo="Últimos 12 meses">
            {totales.some((t) => t.total > 0) ? (
              <GraficoMeses totales={totales} mesElegido={mes} />
            ) : (
              <Text style={[estilos.vacio, { color: colores.textoSuave }]}>
                Aún no hay gastos en el último año.
              </Text>
            )}
          </Tarjeta>

          <TarjetaReparto reparto={reparto} uidActual={usuario.uid} />
        </>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  datos: { flexDirection: 'row', gap: 12 },
  dato: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  vacio: { textAlign: 'center', fontSize: 16, lineHeight: 24, paddingVertical: 12 },
});
