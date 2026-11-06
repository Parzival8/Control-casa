import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Boton } from '../../src/components/Boton';
import { CampoTexto } from '../../src/components/CampoTexto';
import { MensajeError } from '../../src/components/MensajeError';
import { Pantalla } from '../../src/components/Pantalla';
import { Titulo } from '../../src/components/Titulo';
import { iniciarSesion } from '../../src/data/auth';
import { mensajeDeError } from '../../src/utils/errores';
import { validarInicioSesion } from '../../src/utils/validacion';

export default function IniciarSesion() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar() {
    const problema = validarInicioSesion({ email, contrasena });
    if (problema) return setError(problema);
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion({ email, contrasena });
      // No hace falta navegar: el layout raíz cambia de pantalla solo.
    } catch (e) {
      setError(mensajeDeError(e));
      setEnviando(false);
    }
  }

  return (
    <Pantalla centrada>
      <Titulo texto="🏠 Control Casa" subtitulo="Los gastos del hogar, compartidos." />
      <CampoTexto
        etiqueta="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <CampoTexto
        etiqueta="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={entrar}
      />
      <MensajeError mensaje={error} />
      <Boton titulo="Iniciar sesión" onPress={entrar} cargando={enviando} />
      <Boton titulo="Crear una cuenta" variante="secundario" onPress={() => router.push('/registro')} />
      <Boton
        titulo="He olvidado mi contraseña"
        variante="enlace"
        onPress={() => router.push('/recuperar')}
      />
    </Pantalla>
  );
}
