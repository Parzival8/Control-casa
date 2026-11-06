// Editar una categoría: datos, archivar/recuperar y eliminar (solo si no tiene gastos).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { FormularioCategoria } from '../../../src/components/FormularioCategoria';
import { Pantalla } from '../../../src/components/Pantalla';
import { Titulo } from '../../../src/components/Titulo';
import {
  archivarCategoria,
  borrarCategoria,
  categoriaTieneGastos,
  editarCategoria,
} from '../../../src/data/categorias';
import { useCategorias, useHogarActual } from '../../../src/hooks/useHogarActual';
import { mensajeDeError } from '../../../src/utils/errores';
import { centimosATexto } from '../../../src/utils/formato';

export default function EditarCategoria() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const [comprobando, setComprobando] = useState(false);
  const categoria = categorias.find((c) => c.id === id);

  if (!categoria) {
    return (
      <Pantalla centrada>
        <Titulo texto="Esta categoría ya no existe" subtitulo="Puede que alguien del hogar la haya eliminado." />
        <Boton titulo="Volver" onPress={() => router.back()} />
      </Pantalla>
    );
  }

  const avisar = (e) => Alert.alert('No se ha podido guardar el cambio', mensajeDeError(e));

  function guardar(datos) {
    editarCategoria({ hogarId: hogar.id, categoriaId: categoria.id, datos, alFallar: avisar });
    router.back();
  }

  function archivar(archivada) {
    archivarCategoria({ hogarId: hogar.id, categoriaId: categoria.id, archivada, alFallar: avisar });
    router.back();
  }

  async function eliminar() {
    setComprobando(true);
    let tieneGastos;
    try {
      tieneGastos = await categoriaTieneGastos(hogar.id, categoria.id);
    } catch (e) {
      setComprobando(false);
      return Alert.alert('No se ha podido comprobar', mensajeDeError(e));
    }
    setComprobando(false);

    if (tieneGastos) {
      Alert.alert(
        'Esta categoría tiene gastos',
        'No se puede eliminar para no perder la información. Puedes archivarla: dejará de salir al apuntar gastos, pero los antiguos la seguirán mostrando.',
        [
          { text: 'Cancelar', style: 'cancel' },
          ...(categoria.archivada ? [] : [{ text: 'Archivar', onPress: () => archivar(true) }]),
        ],
      );
      return;
    }
    Alert.alert(`¿Eliminar «${categoria.nombre}»?`, 'Se eliminará para todo el hogar.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          borrarCategoria({ hogarId: hogar.id, categoriaId: categoria.id, alFallar: avisar });
          router.back();
        },
      },
    ]);
  }

  return (
    <FormularioCategoria
      key={categoria.id}
      inicial={{
        nombre: categoria.nombre,
        icono: categoria.icono,
        color: categoria.color,
        presupuestoTexto: centimosATexto(categoria.presupuestoMensual),
      }}
      otras={categorias.filter((c) => c.id !== categoria.id)}
      onGuardar={guardar}
      acciones={
        <>
          {categoria.archivada ? (
            <Boton titulo="Recuperar categoría" variante="secundario" onPress={() => archivar(false)} />
          ) : (
            <Boton titulo="Archivar categoría" variante="secundario" onPress={() => archivar(true)} />
          )}
          <Boton titulo="Eliminar categoría" variante="enlace" onPress={eliminar} cargando={comprobando} />
        </>
      }
    />
  );
}
