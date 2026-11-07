// Exportar gastos a CSV (se abre bien en Excel) y compartirlo.
import { useState } from 'react';
import { Text } from 'react-native';

import { Boton } from '../../src/components/Boton';
import { MensajeError } from '../../src/components/MensajeError';
import { Pantalla } from '../../src/components/Pantalla';
import { SelectorMes } from '../../src/components/SelectorMes';
import { Tarjeta } from '../../src/components/Tarjeta';
import { compartirCSV, leerTodosLosGastos } from '../../src/data/exportar';
import { useColores } from '../../src/hooks/useColores';
import { useCategorias, useHogarActual } from '../../src/hooks/useHogarActual';
import { generarCSV, nombreArchivoCSV } from '../../src/utils/csv';
import { mensajeDeError } from '../../src/utils/errores';
import { mesActual } from '../../src/utils/formato';

export default function Exportar() {
  const colores = useColores();
  const hogar = useHogarActual();
  const categorias = useCategorias();
  const [mes, setMes] = useState(mesActual());
  const [exportando, setExportando] = useState(null); // 'mes' | 'todo' | null
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);

  const nombres = {
    nombreCategoria: (id) => categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría',
    nombreMiembro: (uid) => hogar.miembrosInfo?.[uid]?.nombre ?? 'Antiguo miembro',
  };

  async function exportar(soloMes) {
    setError(null);
    setAviso(null);
    setExportando(soloMes ? 'mes' : 'todo');
    try {
      const todos = await leerTodosLosGastos(hogar.id);
      const gastos = soloMes ? todos.filter((g) => g.fecha.startsWith(mes)) : todos;
      if (gastos.length === 0) {
        setAviso(soloMes ? 'No hay gastos ese mes.' : 'Todavía no hay gastos que exportar.');
        return;
      }
      await compartirCSV(nombreArchivoCSV(hogar.nombre, soloMes ? mes : null), generarCSV(gastos, nombres));
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setExportando(null);
    }
  }

  return (
    <Pantalla bordes={['bottom']}>
      <Text style={{ color: colores.textoSuave, fontSize: 15, lineHeight: 21 }}>
        Se crea un archivo CSV que se abre bien en Excel (con tildes y decimales con coma). Después
        elige dónde mandarlo: WhatsApp, correo, Drive…
      </Text>
      <Tarjeta titulo="Un mes">
        <SelectorMes mes={mes} onCambiar={setMes} />
        <Boton
          titulo="Exportar este mes"
          onPress={() => exportar(true)}
          cargando={exportando === 'mes'}
          desactivado={exportando !== null}
        />
      </Tarjeta>
      <Tarjeta titulo="Todo el hogar">
        <Boton
          titulo="Exportar todos los gastos"
          variante="secundario"
          onPress={() => exportar(false)}
          cargando={exportando === 'todo'}
          desactivado={exportando !== null}
        />
      </Tarjeta>
      {aviso ? <Text style={{ color: colores.textoSuave, fontSize: 16 }}>{aviso}</Text> : null}
      <MensajeError mensaje={error} />
    </Pantalla>
  );
}
