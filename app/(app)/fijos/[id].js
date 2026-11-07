import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { Cargando } from '../../../src/components/Cargando';
import { FormularioRecurrente } from '../../../src/components/FormularioRecurrente';
import { Pantalla } from '../../../src/components/Pantalla';
import { Titulo } from '../../../src/components/Titulo';
import { borrarRecurrente, editarRecurrente } from '../../../src/data/recurrentes';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { useRecurrentes } from '../../../src/hooks/useRecurrentes';
import { useSesion } from '../../../src/hooks/useSesion';
import { categoriasElegibles } from '../../../src/utils/categorias';
import { mensajeDeError } from '../../../src/utils/errores';
import { centimosATexto } from '../../../src/utils/formato';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

export default function EditarGastoFijo() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const { usuario } = useSesion();
  const { recurrentes, cargando } = useRecurrentes(hogar.id);
  const fijo = recurrentes.find((r) => r.id === id);

  if (cargando) return <Cargando />;
  if (!fijo) {
    return (
      <Pantalla centrada>
        <Titulo texto="Este gasto fijo ya no existe" subtitulo="Puede que alguien del hogar lo haya borrado." />
        <Boton titulo="Volver" onPress={() => router.back()} />
      </Pantalla>
    );
  }

  const avisar = (e) => Alert.alert('No se ha podido guardar el cambio', mensajeDeError(e));

  function guardar(datos) {
    editarRecurrente({ hogarId: hogar.id, recurrenteId: fijo.id, datos, alFallar: avisar });
    router.back();
  }

  function confirmarBorrado() {
    Alert.alert(
      '¿Eliminar este gasto fijo?',
      'Dejará de apuntarse cada mes. Los gastos que ya se apuntaron se quedan.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            borrarRecurrente({ hogarId: hogar.id, recurrenteId: fijo.id, alFallar: avisar });
            router.back();
          },
        },
      ],
    );
  }

  const miembros = listaMiembros(hogar, usuario.uid);
  if (fijo.pagadoPor && !miembros.some((m) => m.uid === fijo.pagadoPor)) {
    miembros.push({ uid: fijo.pagadoPor, nombre: 'Antiguo miembro', esTu: false });
  }

  return (
    <FormularioRecurrente
      key={fijo.id}
      inicial={{
        importeTexto: centimosATexto(fijo.importe),
        categoriaId: fijo.categoriaId,
        diaTexto: String(fijo.diaDelMes),
        nota: fijo.nota ?? '',
        pagadoPor: fijo.pagadoPor ?? null,
        activo: fijo.activo,
      }}
      categorias={categoriasElegibles(categorias, fijo.categoriaId)}
      miembros={miembros}
      onGuardar={guardar}
      acciones={<Boton titulo="Eliminar gasto fijo" variante="enlace" onPress={confirmarBorrado} />}
    />
  );
}
