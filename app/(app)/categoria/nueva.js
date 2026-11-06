import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { FormularioCategoria } from '../../../src/components/FormularioCategoria';
import { crearCategoria } from '../../../src/data/categorias';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { mensajeDeError } from '../../../src/utils/errores';
import { COLORES } from '../../../src/utils/validacionCategoria';

export default function NuevaCategoria() {
  const router = useRouter();
  const hogar = useHogarActual();
  const categorias = useCategorias();

  function guardar(datos) {
    crearCategoria({
      hogarId: hogar.id,
      datos,
      alFallar: (e) => Alert.alert('No se ha podido crear la categoría', mensajeDeError(e)),
    });
    router.back();
  }

  return (
    <FormularioCategoria
      inicial={{ nombre: '', icono: '📦', color: COLORES[0], presupuestoTexto: '' }}
      otras={categorias}
      onGuardar={guardar}
    />
  );
}
