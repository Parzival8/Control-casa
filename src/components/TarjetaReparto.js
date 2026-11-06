// Reparto del mes entre los miembros: pagado, lo que le toca y quién debe a quién.
import { StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { formatearImporte } from '../utils/formato';
import { textoTransferencia } from '../utils/reparto';
import { Avatar } from './Avatar';
import { Tarjeta } from './Tarjeta';

/**
 * @param {{ reparto: import('../utils/reparto').Reparto, uidActual: string }} props
 */
export function TarjetaReparto({ reparto, uidActual }) {
  const colores = useColores();
  const nombreDe = (uid) => reparto.lineas.find((l) => l.uid === uid)?.nombre ?? '?';

  if (reparto.lineas.length < 2) {
    return (
      <Tarjeta titulo="Reparto entre miembros">
        <Text style={{ color: colores.textoSuave, fontSize: 15 }}>
          Cuando haya más personas en el hogar, aquí verás cuánto ha pagado cada una y quién debe a
          quién.
        </Text>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta titulo="Reparto entre miembros">
      <Text style={{ color: colores.textoSuave, fontSize: 14 }}>
        A partes iguales: {formatearImporte(reparto.totalRepartido)} entre {reparto.lineas.length}.
      </Text>

      {reparto.lineas.map((l) => (
        <View key={l.uid} style={estilos.fila}>
          <Avatar uid={l.uid} nombre={l.nombre} tamano={32} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colores.texto, fontSize: 16, fontWeight: '600' }}>
              {l.nombre}
              {l.uid === uidActual ? ' (tú)' : ''}
            </Text>
            <Text style={{ color: colores.textoSuave, fontSize: 14 }}>
              Ha pagado {formatearImporte(l.pagado)} · le toca {formatearImporte(l.parte)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: l.saldo > 0 ? colores.ok : l.saldo < 0 ? colores.error : colores.textoSuave,
            }}
          >
            {l.saldo > 0 ? '+' : ''}
            {formatearImporte(l.saldo)}
          </Text>
        </View>
      ))}

      <View style={[estilos.separador, { backgroundColor: colores.borde }]} />

      {reparto.transferencias.length === 0 ? (
        <Text style={{ color: colores.ok, fontSize: 16 }}>✅ Estáis en paz: nadie debe nada.</Text>
      ) : (
        reparto.transferencias.map((t) => (
          <Text key={`${t.de}-${t.a}`} style={{ color: colores.texto, fontSize: 16, fontWeight: '600' }}>
            💸 {textoTransferencia(t, nombreDe, uidActual, formatearImporte)}
          </Text>
        ))
      )}

      {reparto.sinIndicar > 0 ? (
        <Text style={{ color: colores.textoSuave, fontSize: 14 }}>
          No cuentan {formatearImporte(reparto.sinIndicar)} de gastos sin «Pagado por». Indica quién
          los pagó para incluirlos.
        </Text>
      ) : null}
      <Text style={{ color: colores.textoSuave, fontSize: 13 }}>
        Es solo informativo: la app no registra los pagos entre vosotros.
      </Text>
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  separador: { height: 1, marginVertical: 4 },
});
