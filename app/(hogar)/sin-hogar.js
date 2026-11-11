import { useRouter } from 'expo-router';

import { Boton } from '../../src/components/Boton';
import { Pantalla } from '../../src/components/Pantalla';
import { Titulo } from '../../src/components/Titulo';
import { cerrarSesion } from '../../src/data/auth';
import { useSesion } from '../../src/hooks/useSesion';

export default function SinHogar() {
  const router = useRouter();
  const { perfil, usuario } = useSesion();
  const nombre = perfil?.nombre || usuario?.nombre || '';

  return (
    <Pantalla centrada>
      <Titulo
        texto={nombre ? `¡Hola, ${nombre}!` : '¡Hola!'}
        subtitulo="Para empezar, crea un hogar nuevo o únete al de otra persona con su código de invitación."
      />
      <Boton titulo="🏠  Crear hogar" onPress={() => router.push('/crear-hogar')} />
      <Boton
        titulo="🔑  Unirme con código"
        variante="secundario"
        onPress={() => router.push('/unirse')}
      />
      <Boton titulo="Cerrar sesión" variante="enlace" onPress={cerrarSesion} />
      <Boton
        titulo="Eliminar mi cuenta"
        variante="enlace"
        onPress={() => router.push('/eliminar-cuenta')}
      />
    </Pantalla>
  );
}
