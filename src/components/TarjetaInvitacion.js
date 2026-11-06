// Código de invitación del hogar: verlo, compartirlo y (el creador) regenerarlo.
import { useState } from 'react';
import { Alert, Share, StyleSheet, Text } from 'react-native';

import { regenerarCodigo } from '../data/hogares';
import { useCaducidadCodigo } from '../hooks/useCaducidadCodigo';
import { useColores } from '../hooks/useColores';
import { mensajeDeError } from '../utils/errores';
import { fechaAISO, formatearFecha } from '../utils/formato';
import { textoInvitacion } from '../utils/textoInvitacion';
import { Boton } from './Boton';
import { MensajeError } from './MensajeError';
import { Tarjeta } from './Tarjeta';

/**
 * @param {{ hogar: import('../data/hogares').Hogar, uid: string }} props
 */
export function TarjetaInvitacion({ hogar, uid }) {
  const colores = useColores();
  const { expiraEn, cargando } = useCaducidadCodigo(hogar.codigoInvitacion);
  const [error, setError] = useState(null);
  const [regenerando, setRegenerando] = useState(false);

  const esCreador = hogar.creadoPor === uid;
  const caducado = !cargando && (!expiraEn || expiraEn <= new Date());

  async function compartir() {
    await Share.share({
      message: textoInvitacion({
        nombreHogar: hogar.nombre,
        codigo: hogar.codigoInvitacion,
        expiraEn,
      }),
    });
  }

  async function regenerar() {
    setError(null);
    setRegenerando(true);
    try {
      await regenerarCodigo({ hogar, uid });
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setRegenerando(false);
    }
  }

  function confirmarRegenerar() {
    Alert.alert(
      '¿Generar un código nuevo?',
      'El código actual dejará de funcionar. Quien ya está en el hogar no se verá afectado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Generar', onPress: regenerar },
      ],
    );
  }

  let estado = '';
  if (cargando) estado = 'Comprobando validez…';
  else if (caducado) estado = 'Este código ha caducado.';
  else estado = `Válido hasta el ${formatearFecha(fechaAISO(expiraEn))}.`;

  return (
    <Tarjeta titulo="Invitar al hogar">
      <Text
        selectable
        accessibilityLabel={`Código de invitación: ${hogar.codigoInvitacion.split('').join(' ')}`}
        style={[estilos.codigo, { color: colores.texto }]}
      >
        {hogar.codigoInvitacion}
      </Text>
      <Text style={{ color: caducado ? colores.error : colores.textoSuave, fontSize: 15 }}>
        {estado}
        {caducado && !esCreador ? ' Pide a quien creó el hogar que genere uno nuevo.' : ''}
      </Text>
      <MensajeError mensaje={error} />
      {!caducado ? <Boton titulo="Compartir código" onPress={compartir} /> : null}
      {esCreador ? (
        <Boton
          titulo="Generar código nuevo"
          variante={caducado ? 'primario' : 'secundario'}
          onPress={caducado ? regenerar : confirmarRegenerar}
          cargando={regenerando}
        />
      ) : null}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  codigo: { fontSize: 34, fontWeight: '700', letterSpacing: 6, textAlign: 'center' },
});
