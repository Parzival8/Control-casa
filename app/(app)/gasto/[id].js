// Editar o eliminar un gasto. Se abre tocando un gasto de la lista.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { Cargando } from '../../../src/components/Cargando';
import { FormularioGasto } from '../../../src/components/FormularioGasto';
import { Pantalla } from '../../../src/components/Pantalla';
import { Titulo } from '../../../src/components/Titulo';
import { borrarGasto, editarGasto } from '../../../src/data/gastos';
import { useGasto } from '../../../src/hooks/useGasto';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { categoriasElegibles } from '../../../src/utils/categorias';
import { mensajeDeError } from '../../../src/utils/errores';
import { centimosATexto, fechaAISO } from '../../../src/utils/formato';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

export default function EditarGasto() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const { usuario } = useSesion();
  const { gasto, cargando } = useGasto(hogar.id, String(id));

  if (cargando) return <Cargando />;
  if (!gasto) {
    return (
      <Pantalla centrada>
        <Titulo texto="Este gasto ya no existe" subtitulo="Puede que alguien del hogar lo haya borrado." />
        <Boton titulo="Volver" onPress={() => router.back()} />
      </Pantalla>
    );
  }

  const avisar = (e) => Alert.alert('No se ha podido guardar el cambio', mensajeDeError(e));

  function guardar(datos) {
    editarGasto({ hogarId: hogar.id, gastoId: gasto.id, uid: usuario.uid, datos, alFallar: avisar });
    router.back();
  }

  function borrar() {
    borrarGasto({ hogarId: hogar.id, gastoId: gasto.id, alFallar: avisar });
    router.back();
  }

  // Si "pagado por" es alguien que ya no está en el hogar, se mantiene como opción.
  const miembros = listaMiembros(hogar, usuario.uid);
  if (gasto.pagadoPor && !miembros.some((m) => m.uid === gasto.pagadoPor)) {
    miembros.push({ uid: gasto.pagadoPor, nombre: 'Antiguo miembro', esTu: false });
  }

  return (
    <FormularioGasto
      // key: si otro miembro cambia el gasto mientras lo editas, no se mezcla.
      key={gasto.id}
      inicial={{
        importeTexto: centimosATexto(gasto.importe),
        categoriaId: gasto.categoriaId,
        fecha: gasto.fecha,
        nota: gasto.nota,
        pagadoPor: gasto.pagadoPor,
      }}
      categorias={categoriasElegibles(categorias, gasto.categoriaId)}
      miembros={miembros}
      hoy={fechaAISO()}
      onGuardar={guardar}
      onBorrar={borrar}
    />
  );
}
