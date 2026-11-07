import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { Pantalla } from '../../../src/components/Pantalla';
import { Tarjeta } from '../../../src/components/Tarjeta';
import { TarjetaInvitacion } from '../../../src/components/TarjetaInvitacion';
import { Version } from '../../../src/components/Version';
import { cerrarSesion } from '../../../src/data/auth';
import { useColores } from '../../../src/hooks/useColores';
import { useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

export default function Ajustes() {
  const router = useRouter();
  const colores = useColores();
  const hogar = useHogarActual();
  const { usuario, perfil } = useSesion();
  const miembros = listaMiembros(hogar, usuario.uid);

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
        <Text style={texto}>{perfil?.nombre || usuario.nombre}</Text>
        <Text style={suave}>{usuario.email}</Text>
      </Tarjeta>

      <Tarjeta titulo={`Hogar: ${hogar.nombre}`}>
        {miembros.map((m) => (
          <Text key={m.uid} style={texto}>
            👤 {m.nombre}
            {m.esTu ? ' (tú)' : ''}
            {m.esCreador ? ' · creador' : ''}
          </Text>
        ))}
      </Tarjeta>

      <TarjetaInvitacion hogar={hogar} uid={usuario.uid} />

      <Tarjeta titulo="Herramientas">
        <Boton titulo="🔁  Gastos fijos" variante="secundario" onPress={() => router.push('/fijos')} />
        <Boton titulo="📤  Exportar a Excel" variante="secundario" onPress={() => router.push('/exportar')} />
      </Tarjeta>

      <Boton titulo="Cerrar sesión" variante="secundario" onPress={confirmarCierre} />
      <Version />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  texto: { fontSize: 17 },
  suave: { fontSize: 15 },
});
