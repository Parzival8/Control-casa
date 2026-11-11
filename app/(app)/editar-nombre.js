// Cambiar el nombre del hogar (?tipo=hogar) o el tuyo (?tipo=perfil).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { Boton } from '../../src/components/Boton';
import { CampoTexto } from '../../src/components/CampoTexto';
import { MensajeError } from '../../src/components/MensajeError';
import { Pantalla } from '../../src/components/Pantalla';
import { cambiarNombreCuenta } from '../../src/data/auth';
import { cambiarMiNombre, cambiarNombreHogar } from '../../src/data/gestionHogar';
import { useHogarActual } from '../../src/hooks/useHogarActual';
import { useSesion } from '../../src/hooks/useSesion';
import { mensajeDeError } from '../../src/utils/errores';
import { validarNombre } from '../../src/utils/validacion';

export default function EditarNombre() {
  const router = useRouter();
  const { tipo } = useLocalSearchParams();
  const esHogar = tipo === 'hogar';
  const hogar = useHogarActual();
  const { usuario, perfil } = useSesion();
  const [nombre, setNombre] = useState(esHogar ? hogar.nombre : perfil?.nombre || usuario.nombre);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const maximo = esHogar ? 40 : 50;

  async function guardar() {
    const problema = validarNombre(nombre, maximo);
    if (problema) return setError(problema);
    setError(null);
    setGuardando(true);
    try {
      if (esHogar) {
        await cambiarNombreHogar({ hogarId: hogar.id, nombre });
      } else {
        await cambiarMiNombre({ uid: usuario.uid, hogarId: hogar.id, nombre });
        await cambiarNombreCuenta(nombre);
      }
      router.back();
    } catch (e) {
      setError(mensajeDeError(e));
      setGuardando(false);
    }
  }

  return (
    <Pantalla bordes={['bottom']}>
      <CampoTexto
        etiqueta={esHogar ? 'Nombre del hogar' : 'Tu nombre'}
        value={nombre}
        onChangeText={setNombre}
        maxLength={maximo}
        autoFocus
        onSubmitEditing={guardar}
      />
      <MensajeError mensaje={error} />
      <Boton titulo="Guardar" onPress={guardar} cargando={guardando} />
    </Pantalla>
  );
}
