// Salir del hogar. Si eres el creador y hay más personas, eliges a quién dejarlo.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { MensajeError } from '../../../src/components/MensajeError';
import { Opcion } from '../../../src/components/Opcion';
import { Pantalla } from '../../../src/components/Pantalla';
import { Tarjeta } from '../../../src/components/Tarjeta';
import { salirDelHogar } from '../../../src/data/gestionHogar';
import { useColores } from '../../../src/hooks/useColores';
import { useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { mensajeDeError } from '../../../src/utils/errores';
import { consecuenciaDeIrse, sucesorPropuesto } from '../../../src/utils/gestionHogar';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

export default function SalirDelHogar() {
  const router = useRouter();
  const colores = useColores();
  const hogar = useHogarActual();
  const { usuario } = useSesion();
  const consecuencia = consecuenciaDeIrse(hogar, usuario.uid);
  const otros = listaMiembros(hogar, usuario.uid).filter((m) => !m.esTu);
  const [sucesor, setSucesor] = useState(sucesorPropuesto(hogar, usuario.uid));
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState(null);

  const texto = { color: colores.texto, fontSize: 16, lineHeight: 23 };

  if (consecuencia === 'borrar') {
    return (
      <Pantalla bordes={['bottom']}>
        <Text style={texto}>
          Eres la única persona del hogar «{hogar.nombre}». Para irte, borra el hogar (se borrarán
          todos sus gastos) o invita antes a alguien para dejárselo.
        </Text>
        <Boton titulo="Borrar el hogar" onPress={() => router.replace('/hogar/borrar')} />
      </Pantalla>
    );
  }

  async function salir() {
    setError(null);
    setSaliendo(true);
    try {
      await salirDelHogar({
        hogarId: hogar.id,
        uid: usuario.uid,
        sucesor: consecuencia === 'traspasar' ? sucesor : null,
      });
      // La app pasa sola a "crear o unirse a un hogar".
    } catch (e) {
      setError(mensajeDeError(e));
      setSaliendo(false);
    }
  }

  function confirmar() {
    Alert.alert(`¿Salir de «${hogar.nombre}»?`, 'Para volver necesitarás un código de invitación.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: salir },
    ]);
  }

  return (
    <Pantalla bordes={['bottom']}>
      <Text style={texto}>
        Dejarás de ver los gastos del hogar. Los que apuntaste se quedan para los demás, con tu
        nombre.
      </Text>
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
      <MensajeError mensaje={error} />
      <Boton titulo="Salir del hogar" onPress={confirmar} cargando={saliendo} />
    </Pantalla>
  );
}
