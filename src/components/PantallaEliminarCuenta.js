// Eliminar la cuenta (obligatorio para Google Play). Pide la contraseña y,
// si es el creador de un hogar con más personas, a quién dejárselo.
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { eliminarCuenta } from '../data/auth';
import { useColores } from '../hooks/useColores';
import { useSesion } from '../hooks/useSesion';
import { mensajeDeError } from '../utils/errores';
import { consecuenciaDeIrse, sucesorPropuesto } from '../utils/gestionHogar';
import { listaMiembros } from '../utils/textoInvitacion';
import { Boton } from './Boton';
import { CampoTexto } from './CampoTexto';
import { MensajeError } from './MensajeError';
import { Opcion } from './Opcion';
import { Pantalla } from './Pantalla';
import { Tarjeta } from './Tarjeta';

/**
 * @param {{ hogar: import('../data/hogares').Hogar|null }} props  null si no tiene hogar.
 */
export function PantallaEliminarCuenta({ hogar }) {
  const colores = useColores();
  const { usuario, perfil } = useSesion();
  const consecuencia = hogar ? consecuenciaDeIrse(hogar, usuario.uid) : null;
  const otros = hogar ? listaMiembros(hogar, usuario.uid).filter((m) => !m.esTu) : [];
  const [sucesor, setSucesor] = useState(hogar ? sucesorPropuesto(hogar, usuario.uid) : null);
  const [contrasena, setContrasena] = useState('');
  const [progreso, setProgreso] = useState(null);
  const [error, setError] = useState(null);

  async function eliminar() {
    setError(null);
    setProgreso('Empezando…');
    try {
      await eliminarCuenta({ contrasena, perfil, hogar, sucesor, alProgresar: setProgreso });
      // Al borrarse la cuenta, la app vuelve sola a "Iniciar sesión".
    } catch (e) {
      setError(mensajeDeError(e));
      setProgreso(null);
    }
  }

  function confirmar() {
    if (!contrasena) return setError('Escribe tu contraseña.');
    Alert.alert(
      '¿Eliminar tu cuenta para siempre?',
      'Esto no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar mi cuenta', style: 'destructive', onPress: eliminar },
      ],
    );
  }

  const texto = { color: colores.texto, fontSize: 16, lineHeight: 23 };

  return (
    <Pantalla bordes={['bottom']}>
      <Tarjeta titulo="Qué se borra">
        <Text style={texto}>• Tu cuenta de acceso ({usuario.email}).</Text>
        <Text style={texto}>• Tu perfil y tu nombre, también en los hogares de los que saliste.</Text>
        <Text style={texto}>
          • Los gastos que apuntaste se quedan en el hogar para los demás, pero sin tu nombre
          (aparecerás como «Antiguo miembro»).
        </Text>
        {consecuencia === 'borrar' ? (
          <Text style={[texto, { color: colores.error, fontWeight: '700' }]}>
            • Como eres la única persona del hogar «{hogar.nombre}», se borrará entero con todos sus
            gastos.
          </Text>
        ) : null}
      </Tarjeta>

      {consecuencia === 'traspasar' ? (
        <Tarjeta titulo="¿A quién dejas el hogar?">
          <Text style={{ color: colores.textoSuave, fontSize: 15 }}>
            Tendrá tus permisos: quitar miembros, generar códigos y borrar el hogar.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {otros.map((m) => (
              <Opcion key={m.uid} texto={m.nombre} seleccionada={sucesor === m.uid} onPress={() => setSucesor(m.uid)} />
            ))}
          </View>
        </Tarjeta>
      ) : null}

      <CampoTexto
        etiqueta="Tu contraseña (para confirmar)"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
        autoComplete="current-password"
      />
      <MensajeError mensaje={error} />
      {progreso ? <Text style={{ color: colores.textoSuave, fontSize: 15 }}>{progreso}</Text> : null}
      <Boton titulo="Eliminar mi cuenta" onPress={confirmar} cargando={Boolean(progreso)} />
    </Pantalla>
  );
}
