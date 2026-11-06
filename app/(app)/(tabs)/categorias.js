// Pestaña Categorías: lista compartida del hogar, con las archivadas aparte.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../../src/components/Boton';
import { Pantalla } from '../../../src/components/Pantalla';
import { useColores } from '../../../src/hooks/useColores';
import { useCategorias } from '../../../src/hooks/useHogarActual';
import { ordenarCategorias } from '../../../src/utils/categorias';
import { formatearImporte } from '../../../src/utils/formato';

function FilaCategoria({ categoria, onPress }) {
  const colores = useColores();
  const presupuesto = categoria.presupuestoMensual
    ? `Presupuesto: ${formatearImporte(categoria.presupuestoMensual)} al mes`
    : null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${categoria.nombre}${presupuesto ? `, ${presupuesto}` : ''}. Toca para editar.`}
      style={({ pressed }) => [
        estilos.fila,
        { backgroundColor: colores.tarjeta, borderColor: colores.borde, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[estilos.icono, { backgroundColor: `${categoria.color}33` }]}>
        <Text style={{ fontSize: 22 }}>{categoria.icono}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colores.texto, fontSize: 17 }}>{categoria.nombre}</Text>
        {presupuesto ? <Text style={{ color: colores.textoSuave, fontSize: 14 }}>{presupuesto}</Text> : null}
      </View>
      <Text style={{ color: colores.textoSuave, fontSize: 22 }}>›</Text>
    </Pressable>
  );
}

export default function Categorias() {
  const router = useRouter();
  const colores = useColores();
  const todas = ordenarCategorias(useCategorias());
  const activas = todas.filter((c) => !c.archivada);
  const archivadas = todas.filter((c) => c.archivada);
  const [verArchivadas, setVerArchivadas] = useState(false);

  const abrir = (c) => router.push(`/categoria/${c.id}`);

  return (
    <Pantalla bordes={[]}>
      <Boton titulo="+  Nueva categoría" onPress={() => router.push('/categoria/nueva')} />
      <View style={{ gap: 8 }}>
        {activas.map((c) => (
          <FilaCategoria key={c.id} categoria={c} onPress={() => abrir(c)} />
        ))}
      </View>
      {archivadas.length > 0 ? (
        <>
          <Boton
            titulo={`${verArchivadas ? 'Ocultar' : 'Ver'} archivadas (${archivadas.length})`}
            variante="enlace"
            onPress={() => setVerArchivadas((v) => !v)}
          />
          {verArchivadas ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: colores.textoSuave, fontSize: 14 }}>
                No se ofrecen al apuntar gastos. Tócalas para recuperarlas.
              </Text>
              {archivadas.map((c) => (
                <FilaCategoria key={c.id} categoria={c} onPress={() => abrir(c)} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  icono: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
