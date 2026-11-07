// Lista de gastos fijos del hogar (alquiler, internet, seguros…).
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { Pantalla } from '../../../src/components/Pantalla';
import { useColores } from '../../../src/hooks/useColores';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { useRecurrentes } from '../../../src/hooks/useRecurrentes';
import { formatearImporte } from '../../../src/utils/formato';

export default function GastosFijos() {
  const router = useRouter();
  const colores = useColores();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const { recurrentes, cargando } = useRecurrentes(hogar.id);
  const porId = new Map(categorias.map((c) => [c.id, c]));
  const ordenados = [...recurrentes].sort((a, b) => a.diaDelMes - b.diaDelMes);

  return (
    <Pantalla bordes={['bottom']}>
      <Boton titulo="+  Nuevo gasto fijo" onPress={() => router.push('/fijos/nuevo')} />
      {!cargando && ordenados.length === 0 ? (
        <Text style={[estilos.vacio, { color: colores.textoSuave }]}>
          🔁 Aún no hay gastos fijos.{'\n'}Añade el alquiler, internet o los seguros y se apuntarán
          solos cada mes.
        </Text>
      ) : null}
      <View style={{ gap: 8 }}>
        {ordenados.map((r) => {
          const c = porId.get(r.categoriaId);
          const titulo = r.nota || c?.nombre || 'Gasto fijo';
          return (
            <Pressable
              key={r.id}
              onPress={() => router.push(`/fijos/${r.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${titulo}, ${formatearImporte(r.importe)}, día ${r.diaDelMes}${r.activo ? '' : ', en pausa'}. Toca para editar.`}
              style={({ pressed }) => [
                estilos.fila,
                {
                  backgroundColor: colores.tarjeta,
                  borderColor: colores.borde,
                  opacity: pressed ? 0.7 : r.activo ? 1 : 0.6,
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{c?.icono ?? '📦'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colores.texto, fontSize: 17 }}>{titulo}</Text>
                <Text style={{ color: colores.textoSuave, fontSize: 14 }}>
                  Día {r.diaDelMes} de cada mes{r.activo ? '' : ' · en pausa'}
                </Text>
              </View>
              <Text style={{ color: colores.texto, fontSize: 17, fontWeight: '700' }}>
                {formatearImporte(r.importe)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  vacio: { textAlign: 'center', fontSize: 16, lineHeight: 24, marginTop: 16 },
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
});
