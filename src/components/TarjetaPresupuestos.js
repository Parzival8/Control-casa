// Presupuestos del mes: barra de lo gastado frente al presupuesto de cada
// categoría. Amarillo desde el 80 % y rojo al superarlo.
import { StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { formatearImporte } from '../utils/formato';
import { Tarjeta } from './Tarjeta';

const COLOR_AVISO = '#f59e0b';

/**
 * @param {{ estados: import('../utils/presupuestos').EstadoPresupuesto[] }} props
 */
export function TarjetaPresupuestos({ estados }) {
  const colores = useColores();
  if (estados.length === 0) return null;

  const colorDe = (nivel) =>
    nivel === 'superado' ? colores.error : nivel === 'aviso' ? COLOR_AVISO : colores.ok;
  const icono = { superado: '🚨', aviso: '⚠️', bien: '' };

  return (
    <Tarjeta titulo="Presupuestos del mes">
      {estados.map((e) => {
        const restante = e.presupuesto - e.gastado;
        const detalle =
          e.nivel === 'superado'
            ? `Superado en ${formatearImporte(-restante)}`
            : `Quedan ${formatearImporte(restante)}`;
        return (
          <View
            key={e.categoriaId}
            style={estilos.linea}
            accessible
            accessibilityLabel={`${e.nombre}: ${formatearImporte(e.gastado)} de ${formatearImporte(e.presupuesto)}, ${Math.round(e.porcentaje)} por ciento. ${detalle}.`}
          >
            <View style={estilos.cabecera}>
              <Text numberOfLines={1} style={[estilos.nombre, { color: colores.texto }]}>
                {icono[e.nivel]} {e.icono} {e.nombre}
              </Text>
              <Text style={{ color: colores.texto, fontSize: 15 }}>
                {formatearImporte(e.gastado)} / {formatearImporte(e.presupuesto)}
              </Text>
            </View>
            <View style={[estilos.fondoBarra, { backgroundColor: colores.borde }]}>
              <View
                style={[
                  estilos.barra,
                  { width: `${Math.min(e.porcentaje, 100)}%`, backgroundColor: colorDe(e.nivel) },
                ]}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                color: e.nivel === 'bien' ? colores.textoSuave : colorDe(e.nivel),
                fontWeight: e.nivel === 'bien' ? '400' : '700',
              }}
            >
              {Math.round(e.porcentaje)} % · {detalle}
            </Text>
          </View>
        );
      })}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  linea: { gap: 6, paddingVertical: 4 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  nombre: { fontSize: 16, flex: 1 },
  fondoBarra: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barra: { height: 10, borderRadius: 5 },
});
