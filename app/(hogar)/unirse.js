import { useState } from 'react';

import { Boton } from '../../src/components/Boton';
import { CampoTexto } from '../../src/components/CampoTexto';
import { MensajeError } from '../../src/components/MensajeError';
import { Pantalla } from '../../src/components/Pantalla';
import { Titulo } from '../../src/components/Titulo';
import { unirseConCodigo } from '../../src/data/hogares';
import { useSesion } from '../../src/hooks/useSesion';
import { mensajeDeError } from '../../src/utils/errores';

export default function Unirse() {
  const { usuario, perfil } = useSesion();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function unirse() {
    setError(null);
    setEnviando(true);
    try {
      await unirseConCodigo({
        usuario,
        nombreUsuario: perfil?.nombre || usuario.nombre || usuario.email.split('@')[0],
        codigo,
      });
      // Al guardarse, el perfil ya tiene hogar y la app pasa a Inicio sola.
    } catch (e) {
      setError(mensajeDeError(e));
      setEnviando(false);
    }
  }

  return (
    <Pantalla bordes={['bottom']}>
      <Titulo subtitulo="Pide el código de invitación a alguien del hogar. Lo encontrará en Ajustes." />
      <CampoTexto
        etiqueta="Código de invitación"
        placeholder="Por ejemplo: K7MP2XQA"
        value={codigo}
        onChangeText={setCodigo}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        autoFocus
        onSubmitEditing={unirse}
        style={{ fontSize: 24, letterSpacing: 4 }}
      />
      <MensajeError mensaje={error} />
      <Boton titulo="Unirme" onPress={unirse} cargando={enviando} desactivado={!codigo.trim()} />
    </Pantalla>
  );
}
