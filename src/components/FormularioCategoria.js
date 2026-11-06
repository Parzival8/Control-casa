// Formulario para crear o editar una categoría: nombre, icono, color y presupuesto.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColores } from '../hooks/useColores';
import { textoACentimos } from '../utils/formato';
import { COLORES, ICONOS, validarCategoria } from '../utils/validacionCategoria';
import { Boton } from './Boton';
import { CampoTexto } from './CampoTexto';
import { MensajeError } from './MensajeError';
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
 *   inicial: { nombre: string, icono: string, color: string, presupuestoTexto: string },
 *   otras: { id: string, nombre: string }[],
 *   onGuardar: (datos: import('../data/categorias').DatosCategoria) => void,
 *   acciones?: React.ReactNode,   Botones extra (archivar, eliminar) en edición.
 * }} props
 */
export function FormularioCategoria({ inicial, otras, onGuardar, acciones }) {
  const colores = useColores();
  const [nombre, setNombre] = useState(inicial.nombre);
  const [icono, setIcono] = useState(inicial.icono);
  const [color, setColor] = useState(inicial.color);
  const [presupuestoTexto, setPresupuestoTexto] = useState(inicial.presupuestoTexto);
  const [error, setError] = useState(null);

  // Si el icono actual no está en la lista (se escribió a mano), se añade al principio.
  const iconos = ICONOS.includes(icono) ? ICONOS : [icono, ...ICONOS];

  function guardar() {
    const presupuesto = presupuestoTexto.trim() ? textoACentimos(presupuestoTexto) : null;
    if (presupuestoTexto.trim() && presupuesto === null) {
      return setError('El presupuesto no es un importe válido.');
    }
    const datos = { nombre, icono, color, presupuestoMensual: presupuesto };
    const problema = validarCategoria(datos, otras);
    if (problema) return setError(problema);
    setError(null);
    onGuardar(datos);
  }

  return (
    <Pantalla bordes={['bottom']}>
      {/* Vista previa */}
      <View style={estilos.previa}>
        <View style={[estilos.circulo, { backgroundColor: `${color}33` }]}>
          <Text style={{ fontSize: 34 }}>{icono}</Text>
        </View>
        <Text style={{ color: colores.texto, fontSize: 20, fontWeight: '600' }}>
          {nombre.trim() || 'Nueva categoría'}
        </Text>
      </View>

      <CampoTexto etiqueta="Nombre" value={nombre} onChangeText={setNombre} maxLength={40} />

      <Seccion titulo="Icono">
        <View style={estilos.rejilla}>
          {iconos.map((i) => (
            <Pressable
              key={i}
              onPress={() => setIcono(i)}
              accessibilityRole="radio"
              accessibilityLabel={`Icono ${i}`}
              accessibilityState={{ selected: i === icono }}
              style={[
                estilos.casilla,
                { borderColor: i === icono ? colores.primario : colores.borde, backgroundColor: colores.tarjeta },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{i}</Text>
            </Pressable>
          ))}
        </View>
        <CampoTexto
          etiqueta="O escribe otro emoji"
          value=""
          onChangeText={(texto) => {
            const emoji = texto.trim();
            if (emoji) setIcono(Array.from(emoji)[0] + (Array.from(emoji)[1] === '️' ? '️' : ''));
          }}
          placeholder="😀"
        />
      </Seccion>

      <Seccion titulo="Color">
        <View style={estilos.rejilla}>
          {COLORES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="radio"
              accessibilityLabel={`Color ${c}`}
              accessibilityState={{ selected: c === color }}
              style={[
                estilos.casilla,
                { backgroundColor: c, borderColor: c === color ? colores.texto : 'transparent' },
              ]}
            >
              {c === color ? <Text style={estilos.marca}>✓</Text> : null}
            </Pressable>
          ))}
        </View>
      </Seccion>

      <CampoTexto
        etiqueta="Presupuesto mensual en € (opcional)"
        value={presupuestoTexto}
        onChangeText={setPresupuestoTexto}
        keyboardType="decimal-pad"
        placeholder="Sin presupuesto"
      />

      <MensajeError mensaje={error} />
      <Boton titulo="Guardar" onPress={guardar} />
      {acciones}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  previa: { alignItems: 'center', gap: 8 },
  circulo: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  casilla: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marca: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
});
