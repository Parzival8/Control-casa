import { useState } from 'react';

import { Boton } from '../../src/components/Boton';
import { CampoTexto } from '../../src/components/CampoTexto';
import { MensajeError } from '../../src/components/MensajeError';
import { Pantalla } from '../../src/components/Pantalla';
import { Titulo } from '../../src/components/Titulo';
import { crearHogar } from '../../src/data/hogares';
import { useSesion } from '../../src/hooks/useSesion';
import { mensajeDeError } from '../../src/utils/errores';
import { validarNombre } from '../../src/utils/validacion';

export default function CrearHogar() {
  const { usuario, perfil } = useSesion();
  const [nombreHogar, setNombreHogar] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function crear() {
    const problema = validarNombre(nombreHogar, 40);
    if (problema) return setError(problema);
    setError(null);
    setEnviando(true);
    try {
      await crearHogar({
        usuario,
        nombreUsuario: perfil?.nombre || usuario.nombre || usuario.email.split('@')[0],
        nombreHogar,
      });
      // Al guardarse, el perfil ya tiene hogar y la app pasa a Inicio sola.
    } catch (e) {
      setError(mensajeDeError(e));
      setEnviando(false);
    }
  }

  return (
    <Pantalla bordes={['bottom']}>
      <Titulo subtitulo="Ponle un nombre que reconozcáis todos. Después podrás invitar a los demás con un código." />
      <CampoTexto
        etiqueta="Nombre del hogar"
        placeholder="Por ejemplo: Casa, Piso de Lavapiés…"
        value={nombreHogar}
        onChangeText={setNombreHogar}
        autoCapitalize="sentences"
        maxLength={40}
        autoFocus
        onSubmitEditing={crear}
      />
      <MensajeError mensaje={error} />
      <Boton titulo="Crear hogar" onPress={crear} cargando={enviando} />
    </Pantalla>
  );
}
