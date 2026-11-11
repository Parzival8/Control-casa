// Ajustes: perfil, hogar (nombre, miembros, invitación), herramientas y cuenta.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../src/components/Avatar';
import { Boton } from '../../../src/components/Boton';
import { MensajeError } from '../../../src/components/MensajeError';
import { Pantalla } from '../../../src/components/Pantalla';
import { Tarjeta } from '../../../src/components/Tarjeta';
import { TarjetaInvitacion } from '../../../src/components/TarjetaInvitacion';
import { Version } from '../../../src/components/Version';
import { cerrarSesion } from '../../../src/data/auth';
import { expulsarMiembro } from '../../../src/data/gestionHogar';
import { useColores } from '../../../src/hooks/useColores';
import { useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { mensajeDeError } from '../../../src/utils/errores';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

/** Botón pequeño de texto (cambiar, quitar). */
function Enlace({ texto, onPress, peligro = false }) {
  const colores = useColores();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={texto}
      hitSlop={10}
      style={({ pressed }) => [estilos.enlace, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={{ color: peligro ? colores.error : colores.primario, fontSize: 15, fontWeight: '600' }}>
        {texto}
      </Text>
    </Pressable>
  );
}

export default function Ajustes() {
  const router = useRouter();
  const colores = useColores();
  const hogar = useHogarActual();
  const { usuario, perfil } = useSesion();
  const miembros = listaMiembros(hogar, usuario.uid);
  const soyCreador = hogar.creadoPor === usuario.uid;
  const [error, setError] = useState(null);

  function confirmarExpulsion(miembro) {
    Alert.alert(
      `¿Quitar a ${miembro.nombre} del hogar?`,
      'Dejará de ver y apuntar gastos al momento. Sus gastos antiguos se quedan, con su nombre.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () =>
            expulsarMiembro({ hogarId: hogar.id, uidExpulsado: miembro.uid }).catch((e) =>
              setError(mensajeDeError(e)),
            ),
        },
      ],
    );
  }

  function confirmarCierre() {
    Alert.alert('¿Cerrar sesión?', 'Podrás volver a entrar con tu email y contraseña.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);
  }

  const texto = [estilos.texto, { color: colores.texto }];
  const suave = [estilos.suave, { color: colores.textoSuave }];

  return (
    <Pantalla bordes={[]}>
      <Tarjeta titulo="Tu perfil">
        <View style={estilos.fila}>
          <View style={{ flex: 1 }}>
            <Text style={texto}>{perfil?.nombre || usuario.nombre}</Text>
            <Text style={suave}>{usuario.email}</Text>
          </View>
          <Enlace texto="Cambiar" onPress={() => router.push('/editar-nombre?tipo=perfil')} />
        </View>
      </Tarjeta>

      <Tarjeta titulo="Hogar">
        <View style={estilos.fila}>
          <Text style={[texto, { flex: 1, fontWeight: '700' }]}>{hogar.nombre}</Text>
          <Enlace texto="Cambiar nombre" onPress={() => router.push('/editar-nombre?tipo=hogar')} />
        </View>
        <Text style={suave}>Miembros ({miembros.length})</Text>
        {miembros.map((m) => (
          <View key={m.uid} style={estilos.fila}>
            <Avatar uid={m.uid} nombre={m.nombre} tamano={30} />
            <Text style={[texto, { flex: 1 }]}>
              {m.nombre}
              {m.esTu ? ' (tú)' : ''}
              {m.esCreador ? ' · creador' : ''}
            </Text>
            {soyCreador && !m.esTu ? (
              <Enlace texto="Quitar" peligro onPress={() => confirmarExpulsion(m)} />
            ) : null}
          </View>
        ))}
        <MensajeError mensaje={error} />
      </Tarjeta>

      <TarjetaInvitacion hogar={hogar} uid={usuario.uid} />

      <Tarjeta titulo="Herramientas">
        <Boton titulo="🔁  Gastos fijos" variante="secundario" onPress={() => router.push('/fijos')} />
        <Boton titulo="📤  Exportar a Excel" variante="secundario" onPress={() => router.push('/exportar')} />
      </Tarjeta>

      <Tarjeta titulo="Cuenta">
        <Boton titulo="Cerrar sesión" variante="secundario" onPress={confirmarCierre} />
        <Boton titulo="Salir del hogar" variante="enlace" onPress={() => router.push('/hogar/salir')} />
        {soyCreador ? (
          <Boton titulo="Borrar el hogar" variante="enlace" onPress={() => router.push('/hogar/borrar')} />
        ) : null}
        <Boton titulo="Eliminar mi cuenta" variante="enlace" onPress={() => router.push('/cuenta/eliminar')} />
      </Tarjeta>

      <Version />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  texto: { fontSize: 17 },
  suave: { fontSize: 15 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  enlace: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
});
