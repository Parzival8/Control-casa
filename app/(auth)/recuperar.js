import { useState } from 'react';
import { Text } from 'react-native';

import { Boton } from '../../src/components/Boton';
import { CampoTexto } from '../../src/components/CampoTexto';
import { MensajeError } from '../../src/components/MensajeError';
import { Pantalla } from '../../src/components/Pantalla';
import { Titulo } from '../../src/components/Titulo';
import { recuperarContrasena } from '../../src/data/auth';
import { useColores } from '../../src/hooks/useColores';
import { mensajeDeError } from '../../src/utils/errores';
import { esEmailValido } from '../../src/utils/validacion';

export default function Recuperar() {
  const colores = useColores();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!esEmailValido(email)) return setError('Escribe un email válido.');
    setError(null);
    setEnviando(true);
    try {
      await recuperarContrasena(email);
      setEnviado(true);
    } catch (e) {
      // Por seguridad, si el email no existe decimos lo mismo que si existe.
      if (String(e?.code).includes('user-not-found')) setEnviado(true);
      else setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pantalla bordes={['bottom']}>
      <Titulo subtitulo="Te enviaremos un email con un enlace para elegir una contraseña nueva." />
      <CampoTexto
        etiqueta="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onSubmitEditing={enviar}
      />
      <MensajeError mensaje={error} />
      {enviado ? (
        <Text accessibilityLiveRegion="polite" style={{ color: colores.ok, fontSize: 16 }}>
          ✅ Si hay una cuenta con ese email, te llegará el enlace en unos minutos. Mira también
          en la carpeta de spam.
        </Text>
      ) : null}
      <Boton titulo="Enviar enlace" onPress={enviar} cargando={enviando} />
    </Pantalla>
  );
}
