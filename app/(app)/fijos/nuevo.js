import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { FormularioRecurrente } from '../../../src/components/FormularioRecurrente';
import { crearRecurrente } from '../../../src/data/recurrentes';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { useSesion } from '../../../src/hooks/useSesion';
import { categoriasElegibles } from '../../../src/utils/categorias';
import { mensajeDeError } from '../../../src/utils/errores';
import { listaMiembros } from '../../../src/utils/textoInvitacion';

export default function NuevoGastoFijo() {
  const router = useRouter();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const { usuario } = useSesion();

  function guardar(datos) {
    crearRecurrente({
      hogarId: hogar.id,
      datos,
      alFallar: (e) => Alert.alert('No se ha podido guardar el gasto fijo', mensajeDeError(e)),
    });
    router.back();
  }

  return (
    <FormularioRecurrente
      inicial={{ importeTexto: '', categoriaId: null, diaTexto: '1', nota: '', pagadoPor: null, activo: true }}
      categorias={categoriasElegibles(categorias)}
      miembros={listaMiembros(hogar, usuario.uid)}
      onGuardar={guardar}
    />
  );
}
