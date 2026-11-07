// Formulario de un gasto fijo: importe, categoría, día del mes, nota, quién paga
// y si está activo.
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { textoACentimos } from '../utils/formato';
import { validarRecurrente } from '../utils/recurrentes';
import { Boton } from './Boton';
import { CampoTexto } from './CampoTexto';
import { MensajeError } from './MensajeError';
import { Opcion } from './Opcion';
import { Pantalla } from './Pantalla';

function Seccion({ titulo, children }) {
  const colores = useColores();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colores.texto, fontSize: 16, fontWeight: '600' }}>{titulo}</Text>
      {children}
    </View>
  );
}

/**
 * @param {{
 *   inicial: { importeTexto: string, categoriaId: string|null, diaTexto: string,
 *              nota: string, pagadoPor: string|null, activo: boolean },
 *   categorias: import('../utils/categoriasIniciales').Categoria[],
 *   miembros: { uid: string, nombre: string, esTu: boolean }[],
 *   onGuardar: (datos: import('../data/recurrentes').DatosRecurrente) => void,
 *   acciones?: React.ReactNode,
 * }} props
 */
export function FormularioRecurrente({ inicial, categorias, miembros, onGuardar, acciones }) {
  const colores = useColores();
  const [importeTexto, setImporteTexto] = useState(inicial.importeTexto);
  const [categoriaId, setCategoriaId] = useState(inicial.categoriaId);
  const [diaTexto, setDiaTexto] = useState(inicial.diaTexto);
  const [nota, setNota] = useState(inicial.nota);
  const [pagadoPor, setPagadoPor] = useState(inicial.pagadoPor);
  const [activo, setActivo] = useState(inicial.activo);
  const [error, setError] = useState(null);

  function guardar() {
    const datos = {
      importe: textoACentimos(importeTexto),
      categoriaId,
      diaDelMes: Number.parseInt(diaTexto, 10),
      nota,
      pagadoPor,
      activo,
    };
    const problema = validarRecurrente(datos);
    if (problema) return setError(problema);
    setError(null);
    onGuardar(datos);
  }

  return (
    <Pantalla bordes={['bottom']}>
      <Text style={{ color: colores.textoSuave, fontSize: 15, lineHeight: 21 }}>
        Se apuntará solo cada mes el día que elijas (al abrir la app ese día o después).
      </Text>
      <CampoTexto
        etiqueta="Importe (€)"
        value={importeTexto}
        onChangeText={setImporteTexto}
        keyboardType="decimal-pad"
        placeholder="0,00"
        style={{ fontSize: 28, fontWeight: '700' }}
      />
      <CampoTexto
        etiqueta="Día del mes (1 a 28)"
        value={diaTexto}
        onChangeText={setDiaTexto}
        keyboardType="number-pad"
        maxLength={2}
        placeholder="1"
      />
      <Seccion titulo="Categoría">
        <View style={estilos.rejilla}>
          {categorias.map((c) => (
            <Opcion
              key={c.id}
              texto={c.nombre}
              icono={c.icono}
              ancho="31%"
              seleccionada={c.id === categoriaId}
              onPress={() => setCategoriaId(c.id)}
            />
          ))}
        </View>
      </Seccion>
      <CampoTexto
        etiqueta="Nota (opcional)"
        value={nota}
        onChangeText={setNota}
        placeholder="Por ejemplo: alquiler"
        maxLength={200}
      />
      <Seccion titulo="Pagado por (opcional)">
        <View style={estilos.fila}>
          <Opcion texto="Sin indicar" seleccionada={pagadoPor === null} onPress={() => setPagadoPor(null)} />
          {miembros.map((m) => (
            <Opcion
              key={m.uid}
              texto={m.esTu ? `${m.nombre} (tú)` : m.nombre}
              seleccionada={pagadoPor === m.uid}
              onPress={() => setPagadoPor(m.uid)}
            />
          ))}
        </View>
      </Seccion>
      <View style={estilos.interruptor}>
        <Text style={{ color: colores.texto, fontSize: 17, flex: 1 }}>
          {activo ? 'Activo: se apunta cada mes' : 'En pausa: no se apunta'}
        </Text>
        <Switch
          value={activo}
          onValueChange={setActivo}
          accessibilityLabel="Gasto fijo activo"
          trackColor={{ true: colores.primario }}
        />
      </View>
      <MensajeError mensaje={error} />
      <Boton titulo="Guardar" onPress={guardar} />
      {acciones}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interruptor: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
});
