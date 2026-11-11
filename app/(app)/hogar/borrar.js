// Borrar el hogar (solo quien lo creó), con doble confirmación: escribir el
// nombre del hogar y confirmar en un aviso.
import { useState } from 'react';
import { Alert, Text } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { CampoTexto } from '../../../src/components/CampoTexto';
import { MensajeError } from '../../../src/components/MensajeError';
import { Pantalla } from '../../../src/components/Pantalla';
import { borrarHogar } from '../../../src/data/gestionHogar';
import { useColores } from '../../../src/hooks/useColores';
import { useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { mensajeDeError } from '../../../src/utils/errores';

export default function BorrarHogar() {
  const colores = useColores();
  const hogar = useHogarActual();
  const { usuario } = useSesion();
  const [nombre, setNombre] = useState('');
  const [progreso, setProgreso] = useState(null);
  const [error, setError] = useState(null);

  const esCreador = hogar.creadoPor === usuario.uid;
  const coincide = nombre.trim().toLocaleLowerCase('es') === hogar.nombre.trim().toLocaleLowerCase('es');

  if (!esCreador) {
    return (
      <Pantalla centrada>
        <Text style={{ color: colores.texto, fontSize: 17, textAlign: 'center' }}>
          Solo quien creó el hogar puede borrarlo.
        </Text>
      </Pantalla>
    );
  }

  async function borrar() {
    setError(null);
    setProgreso('Empezando…');
    try {
      await borrarHogar({ hogar, uid: usuario.uid, alProgresar: setProgreso });
      // La app pasa sola a "crear o unirse a un hogar".
    } catch (e) {
      setError(mensajeDeError(e));
      setProgreso(null);
    }
  }

  function confirmar() {
    Alert.alert(
      `¿Borrar «${hogar.nombre}» para siempre?`,
      `Se borrarán todos los gastos, categorías y gastos fijos para las ${hogar.miembros.length} personas del hogar. No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: borrar },
      ],
    );
  }

  return (
    <Pantalla bordes={['bottom']}>
      <Text style={{ color: colores.error, fontSize: 17, lineHeight: 24, fontWeight: '600' }}>
        ⚠️ Se borrará el hogar con todos sus gastos para todas las personas que están en él. Si
        quieres conservarlos, expórtalos antes a Excel.
      </Text>
      <CampoTexto
        etiqueta={`Escribe «${hogar.nombre}» para confirmar`}
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="none"
      />
      <MensajeError mensaje={error} />
      {progreso ? <Text style={{ color: colores.textoSuave, fontSize: 15 }}>{progreso}</Text> : null}
      <Boton titulo="Borrar el hogar" onPress={confirmar} desactivado={!coincide} cargando={Boolean(progreso)} />
    </Pantalla>
  );
}
