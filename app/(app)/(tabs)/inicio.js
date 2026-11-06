// Inicio: total del mes, cambio de mes y lista de gastos en tiempo real.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { BotonFlotante } from '../../../src/components/BotonFlotante';
import { FilaGasto } from '../../../src/components/FilaGasto';
import { MensajeError } from '../../../src/components/MensajeError';
import { SelectorMes } from '../../../src/components/SelectorMes';
import { TarjetaInvitacion } from '../../../src/components/TarjetaInvitacion';
import { useColores } from '../../../src/hooks/useColores';
import { useGastosDelMes } from '../../../src/hooks/useGastosDelMes';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { mensajeDeError } from '../../../src/utils/errores';
import { formatearImporte, mesActual } from '../../../src/utils/formato';

export default function Inicio() {
  const router = useRouter();
  const colores = useColores();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const { usuario } = useSesion();
  const [mes, setMes] = useState(mesActual());
  const { gastos, total, cargando, error } = useGastosDelMes(hogar.id, mes);

  const categoriaPorId = new Map(categorias.map((c) => [c.id, c]));
  const nombreDe = (uid) => (uid ? (hogar.miembrosInfo?.[uid]?.nombre ?? 'Antiguo miembro') : null);
  const estaSolo = hogar.miembros.length === 1;

  const cabecera = (
    <View style={estilos.cabecera}>
      <SelectorMes mes={mes} onCambiar={setMes} />
      <View style={estilos.total} accessible accessibilityLabel={`Total del mes: ${formatearImporte(total)}`}>
        <Text style={[estilos.importeTotal, { color: colores.texto }]}>{formatearImporte(total)}</Text>
        <Text style={{ color: colores.textoSuave, fontSize: 15 }}>
          {gastos.length === 1 ? '1 gasto' : `${gastos.length} gastos`}
        </Text>
      </View>
      <MensajeError mensaje={error ? mensajeDeError(error) : null} />
    </View>
  );

  const vacio = cargando ? (
    <ActivityIndicator color={colores.primario} style={{ marginTop: 24 }} />
  ) : (
    <Text style={[estilos.vacio, { color: colores.textoSuave }]}>
      No hay gastos este mes.{'\n'}Pulsa + para apuntar el primero.
    </Text>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={gastos}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <FilaGasto
            gasto={item}
            categoria={categoriaPorId.get(item.categoriaId)}
            nombrePagador={nombreDe(item.pagadoPor)}
            onPress={() => router.push(`/gasto/${item.id}`)}
          />
        )}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={vacio}
        ListFooterComponent={
          estaSolo ? (
            <View style={{ marginTop: 16 }}>
              <TarjetaInvitacion hogar={hogar} uid={usuario.uid} />
            </View>
          ) : null
        }
        contentContainerStyle={estilos.lista}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
      <BotonFlotante
        etiqueta="Apuntar gasto"
        onPress={() => router.push({ pathname: '/gasto/nuevo', params: { mes } })}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 110 },
  cabecera: { gap: 8, marginBottom: 16 },
  total: { alignItems: 'center', gap: 2 },
  importeTotal: { fontSize: 40, fontWeight: '800' },
  vacio: { textAlign: 'center', fontSize: 17, lineHeight: 26, marginTop: 24 },
});
