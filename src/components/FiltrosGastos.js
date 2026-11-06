// Filtros de la lista de Inicio: por categoría y por quién pagó.
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { SIN_INDICAR } from '../utils/resumen';
import { Opcion } from './Opcion';

function FilaFiltro({ titulo, children }) {
  const colores = useColores();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colores.textoSuave, fontSize: 14 }}>{titulo}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
        {children}
      </ScrollView>
    </View>
  );
}

/**
 * @param {{ filtros: import('../utils/resumen').Filtros,
 *           onCambiar: (filtros: import('../utils/resumen').Filtros) => void,
 *           categorias: { id: string, nombre: string, icono: string }[],
 *           miembros: { uid: string, nombre: string, esTu: boolean }[] }} props
 */
export function FiltrosGastos({ filtros, onCambiar, categorias, miembros }) {
  const ponerCategoria = (categoriaId) => onCambiar({ ...filtros, categoriaId });
  const ponerPagador = (pagadoPor) => onCambiar({ ...filtros, pagadoPor });

  return (
    <View style={{ gap: 10 }}>
      <FilaFiltro titulo="Categoría">
        <Opcion texto="Todas" seleccionada={!filtros.categoriaId} onPress={() => ponerCategoria(null)} />
        {categorias.map((c) => (
          <Opcion
            key={c.id}
            texto={`${c.icono} ${c.nombre}`}
            seleccionada={filtros.categoriaId === c.id}
            onPress={() => ponerCategoria(c.id)}
          />
        ))}
      </FilaFiltro>
      <FilaFiltro titulo="Pagado por">
        <Opcion texto="Todos" seleccionada={!filtros.pagadoPor} onPress={() => ponerPagador(null)} />
        {miembros.map((m) => (
          <Opcion
            key={m.uid}
            texto={m.esTu ? `${m.nombre} (tú)` : m.nombre}
            seleccionada={filtros.pagadoPor === m.uid}
            onPress={() => ponerPagador(m.uid)}
          />
        ))}
        <Opcion
          texto="Sin indicar"
          seleccionada={filtros.pagadoPor === SIN_INDICAR}
          onPress={() => ponerPagador(SIN_INDICAR)}
        />
      </FilaFiltro>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { gap: 8, paddingRight: 8 },
});
