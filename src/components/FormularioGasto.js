// Formulario para apuntar o editar un gasto. Pensado para hacerlo en menos de
// 10 segundos: el importe está enfocado al abrir y lo demás ya viene relleno.
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { fechaAISO, formatearFecha, isoAFecha, textoACentimos } from '../utils/formato';
import { validarGasto } from '../utils/gastos';
import { Boton } from './Boton';
import { CampoTexto } from './CampoTexto';
import { MensajeError } from './MensajeError';
import { Opcion } from './Opcion';
import { Pantalla } from './Pantalla';

function Seccion({ titulo, children }) {
  const colores = useColores();
  return (
    <View style={estilos.seccion}>
      <Text style={[estilos.tituloSeccion, { color: colores.texto }]}>{titulo}</Text>
      {children}
    </View>
  );
}

/**
 * @param {{
 *   inicial: { importeTexto: string, categoriaId: string|null, fecha: string,
 *              nota: string, pagadoPor: string|null },
 *   categorias: import('../utils/categoriasIniciales').Categoria[],
 *   miembros: { uid: string, nombre: string, esTu: boolean }[],
 *   hoy: string,
 *   onGuardar: (datos: import('../data/gastos').DatosGasto) => void,
 *   onBorrar?: () => void,
 * }} props
 */
export function FormularioGasto({ inicial, categorias, miembros, hoy, onGuardar, onBorrar }) {
  const colores = useColores();
  const [importeTexto, setImporteTexto] = useState(inicial.importeTexto);
  const [categoriaId, setCategoriaId] = useState(inicial.categoriaId);
  const [fecha, setFecha] = useState(inicial.fecha);
  const [nota, setNota] = useState(inicial.nota);
  const [pagadoPor, setPagadoPor] = useState(inicial.pagadoPor);
  const [error, setError] = useState(null);

  const ayer = fechaAISO(new Date(isoAFecha(hoy).getTime() - 24 * 60 * 60 * 1000));

  function elegirOtraFecha() {
    DateTimePickerAndroid.open({
      value: isoAFecha(fecha),
      mode: 'date',
      onChange: (evento, elegida) => {
        if (evento.type === 'set' && elegida) setFecha(fechaAISO(elegida));
      },
    });
  }

  function guardar() {
    const datos = { importe: textoACentimos(importeTexto), categoriaId, fecha, nota, pagadoPor };
    const problema = validarGasto(datos);
    if (problema) return setError(problema);
    setError(null);
    onGuardar(datos);
  }

  function confirmarBorrado() {
    Alert.alert('¿Eliminar este gasto?', 'Se borrará para todo el hogar.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: onBorrar },
    ]);
  }

  return (
    <Pantalla bordes={['bottom']}>
      <CampoTexto
        etiqueta="Importe (€)"
        value={importeTexto}
        onChangeText={setImporteTexto}
        keyboardType="decimal-pad"
        placeholder="0,00"
        autoFocus={!inicial.importeTexto}
        style={estilos.importe}
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

      <Seccion titulo={`Fecha: ${formatearFecha(fecha)}`}>
        <View style={estilos.fila}>
          <Opcion texto="Hoy" ancho="31%" seleccionada={fecha === hoy} onPress={() => setFecha(hoy)} />
          <Opcion texto="Ayer" ancho="31%" seleccionada={fecha === ayer} onPress={() => setFecha(ayer)} />
          <Opcion
            texto="Otro día…"
            ancho="31%"
            seleccionada={fecha !== hoy && fecha !== ayer}
            onPress={elegirOtraFecha}
          />
        </View>
      </Seccion>

      <CampoTexto
        etiqueta="Nota (opcional)"
        value={nota}
        onChangeText={setNota}
        placeholder="Por ejemplo: compra semanal"
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

      <MensajeError mensaje={error} />
      <Boton titulo="Guardar" onPress={guardar} />
      {onBorrar ? (
        <Boton titulo="Eliminar gasto" variante="enlace" onPress={confirmarBorrado} />
      ) : null}
      <Text style={{ color: colores.textoSuave, fontSize: 13, textAlign: 'center' }}>
        Lo verá al momento todo el hogar. Sin conexión se guarda en el móvil y se envía al volver
        la red.
      </Text>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  importe: { fontSize: 32, fontWeight: '700', minHeight: 64 },
  seccion: { gap: 8 },
  tituloSeccion: { fontSize: 16, fontWeight: '600' },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
