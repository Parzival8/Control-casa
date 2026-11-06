// Inicio: total del mes, cambio de mes, resumen por categoría, filtros y
// lista de gastos en tiempo real.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { BotonFlotante } from '../../../src/components/BotonFlotante';
import { FilaGasto } from '../../../src/components/FilaGasto';
import { FiltrosGastos } from '../../../src/components/FiltrosGastos';
import { MensajeError } from '../../../src/components/MensajeError';
import { ResumenCategorias } from '../../../src/components/ResumenCategorias';
import { SelectorMes } from '../../../src/components/SelectorMes';
import { TarjetaInvitacion } from '../../../src/components/TarjetaInvitacion';
import { useColores } from '../../../src/hooks/useColores';
import { useGastosDelMes } from '../../../src/hooks/useGastosDelMes';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { mensajeDeError } from '../../../src/utils/errores';
import { formatearImporte, mesActual } from '../../../src/utils/formato';
import { totalCentimos } from '../../../src/utils/gastos';
import { filtrarGastos, hayFiltros, resumenPorCategoria } from '../../../src/utils/resumen';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

const SIN_FILTROS = { categoriaId: null, pagadoPor: null };

export default function Inicio() {
  const router = useRouter();
  const colores = useColores();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const { usuario } = useSesion();
  const [mes, setMes] = useState(mesActual());
  const { gastos, total, cargando, error } = useGastosDelMes(hogar.id, mes);
  const [filtros, setFiltros] = useState(SIN_FILTROS);
  const [verFiltros, setVerFiltros] = useState(false);

  const resumen = resumenPorCategoria(gastos, categorias);
  const filtrados = filtrarGastos(gastos, filtros);
  const filtrando = hayFiltros(filtros);
  const quitarFiltros = () => setFiltros(SIN_FILTROS);

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
      <ResumenCategorias
        lineas={resumen}
        seleccionada={filtros.categoriaId}
        onElegir={(categoriaId) => setFiltros({ ...filtros, categoriaId })}
      />
      {gastos.length > 0 ? (
        <Boton
          titulo={verFiltros ? 'Ocultar filtros' : 'Filtrar gastos'}
          variante="enlace"
          onPress={() => setVerFiltros((v) => !v)}
        />
      ) : null}
      {verFiltros ? (
        <FiltrosGastos
          filtros={filtros}
          onCambiar={setFiltros}
          categorias={resumen.map((l) => ({ id: l.categoriaId, nombre: l.nombre, icono: l.icono }))}
          miembros={listaMiembros(hogar, usuario.uid)}
        />
      ) : null}
      {filtrando ? (
        <View style={estilos.avisoFiltro}>
          <Text style={{ color: colores.texto, fontSize: 15, flex: 1 }}>
            Mostrando {filtrados.length} de {gastos.length} · {formatearImporte(totalCentimos(filtrados))}
          </Text>
          <Boton titulo="Quitar filtros" variante="enlace" onPress={quitarFiltros} />
        </View>
      ) : null}
    </View>
  );

  const vacio = cargando ? (
    <ActivityIndicator color={colores.primario} style={{ marginTop: 24 }} />
  ) : (
    <Text style={[estilos.vacio, { color: colores.textoSuave }]}>
      {filtrando
        ? 'Ningún gasto coincide con los filtros.'
        : 'No hay gastos este mes.\nPulsa + para apuntar el primero.'}
    </Text>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filtrados}
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
  avisoFiltro: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
