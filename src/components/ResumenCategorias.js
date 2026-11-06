// Resumen del mes por categoría con barras. Tocar una línea filtra la lista.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { formatearImporte } from '../utils/formato';
import { Tarjeta } from './Tarjeta';

/**
 * @param {{ lineas: import('../utils/resumen').LineaResumen[],
 *           seleccionada: string|null, onElegir: (categoriaId: string|null) => void }} props
 */
export function ResumenCategorias({ lineas, seleccionada, onElegir }) {
  const colores = useColores();
  if (lineas.length === 0) return null;

  return (
    <Tarjeta titulo="Por categoría">
      {lineas.map((l) => {
        const activa = seleccionada === l.categoriaId;
        return (
          <Pressable
            key={l.categoriaId}
            onPress={() => onElegir(activa ? null : l.categoriaId)}
            accessibilityRole="button"
            accessibilityLabel={`${l.nombre}: ${formatearImporte(l.total)}, ${Math.round(l.porcentaje)} por ciento del mes. Toca para ${activa ? 'quitar el filtro' : 'ver solo esta categoría'}.`}
            style={({ pressed }) => [estilos.linea, { opacity: pressed ? 0.6 : 1 }]}
          >
            <View style={estilos.cabecera}>
              <Text
                numberOfLines={1}
                style={[estilos.nombre, { color: colores.texto, fontWeight: activa ? '700' : '400' }]}
              >
                {l.icono} {l.nombre}
              </Text>
              <Text style={[estilos.importe, { color: colores.texto }]}>{formatearImporte(l.total)}</Text>
            </View>
            <View style={[estilos.fondoBarra, { backgroundColor: colores.borde }]}>
              <View
                style={[
                  estilos.barra,
                  // Mínimo visible para importes muy pequeños.
                  { width: `${Math.max(l.porcentaje, 2)}%`, backgroundColor: l.color },
                ]}
              />
            </View>
          </Pressable>
        );
      })}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  linea: { gap: 6, paddingVertical: 4 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  nombre: { fontSize: 16, flex: 1 },
  importe: { fontSize: 16, fontWeight: '600' },
  fondoBarra: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barra: { height: 10, borderRadius: 5 },
});
