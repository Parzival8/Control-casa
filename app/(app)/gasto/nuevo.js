// Apuntar un gasto nuevo. Se abre con el botón (+) de Inicio.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { FormularioGasto } from '../../../src/components/FormularioGasto';
import { crearGasto } from '../../../src/data/gastos';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { categoriasElegibles } from '../../../src/utils/categorias';
import { mensajeDeError } from '../../../src/utils/errores';
import { fechaAISO, mesActual } from '../../../src/utils/formato';
import { fechaPorDefecto } from '../../../src/utils/meses';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

export default function NuevoGasto() {
  const router = useRouter();
  const { mes = mesActual() } = useLocalSearchParams();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const { usuario } = useSesion();
  const hoy = fechaAISO();

  function guardar(datos) {
    crearGasto({
      hogarId: hogar.id,
      uid: usuario.uid,
      datos,
      alFallar: (e) => Alert.alert('No se ha podido guardar el gasto', mensajeDeError(e)),
    });
    // No se espera al servidor: el gasto ya aparece en la lista (también sin conexión).
    router.back();
  }

  return (
    <FormularioGasto
      inicial={{
        importeTexto: '',
        categoriaId: null,
        fecha: fechaPorDefecto(String(mes), hoy),
        nota: '',
        pagadoPor: null,
      }}
      categorias={categoriasElegibles(categorias)}
      miembros={listaMiembros(hogar, usuario.uid)}
      hoy={hoy}
      onGuardar={guardar}
    />
  );
}
