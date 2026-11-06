import { useState } from 'react';

import { Boton } from '../../src/components/Boton';
import { CampoTexto } from '../../src/components/CampoTexto';
import { MensajeError } from '../../src/components/MensajeError';
import { Pantalla } from '../../src/components/Pantalla';
import { Titulo } from '../../src/components/Titulo';
import { registrar } from '../../src/data/auth';
import { mensajeDeError } from '../../src/utils/errores';
import { validarRegistro } from '../../src/utils/validacion';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [repetida, setRepetida] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function crearCuenta() {
    const problema = validarRegistro({ nombre, email, contrasena, repetida });
    if (problema) return setError(problema);
    setError(null);
    setEnviando(true);
    try {
      await registrar({ nombre, email, contrasena });
    } catch (e) {
      setError(mensajeDeError(e));
      setEnviando(false);
    }
  }

  return (
    <Pantalla bordes={['bottom']}>
      <Titulo subtitulo="Con tu nombre te reconocerán las personas con las que compartes el hogar." />
      <CampoTexto
        etiqueta="Tu nombre"
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
        autoComplete="name"
        maxLength={50}
      />
      <CampoTexto
        etiqueta="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <CampoTexto
        etiqueta="Contraseña (mínimo 6 caracteres)"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
        autoComplete="new-password"
      />
      <CampoTexto
        etiqueta="Repite la contraseña"
        value={repetida}
        onChangeText={setRepetida}
        secureTextEntry
        autoComplete="new-password"
        onSubmitEditing={crearCuenta}
      />
      <MensajeError mensaje={error} />
      <Boton titulo="Crear cuenta" onPress={crearCuenta} cargando={enviando} />
    </Pantalla>
  );
}
