// Inicio. En la Fase 2 aquí estarán el total del mes y la lista de gastos.
import { Text } from 'react-native';

import { Pantalla } from '../../src/components/Pantalla';
import { Tarjeta } from '../../src/components/Tarjeta';
import { TarjetaInvitacion } from '../../src/components/TarjetaInvitacion';
import { useColores } from '../../src/hooks/useColores';
import { useHogarActual } from '../../src/hooks/useHogarActual';
import { useSesion } from '../../src/hooks/useSesion';
import { listaMiembros } from '../../src/utils/textoInvitacion';

export default function Inicio() {
  const colores = useColores();
  const hogar = useHogarActual();
  const { usuario } = useSesion();
  const miembros = listaMiembros(hogar, usuario.uid);
  const estaSolo = miembros.length === 1;

  return (
    <Pantalla bordes={[]}>
      <Tarjeta titulo="Gastos del mes">
        <Text style={{ color: colores.textoSuave, fontSize: 16, lineHeight: 22 }}>
          Todavía no hay gastos. Muy pronto podrás apuntarlos desde aquí y los verá todo el hogar.
        </Text>
      </Tarjeta>
      <Tarjeta titulo={`En el hogar (${miembros.length})`}>
        {miembros.map((m) => (
          <Text key={m.uid} style={{ color: colores.texto, fontSize: 17 }}>
            👤 {m.nombre}
            {m.esTu ? ' (tú)' : ''}
          </Text>
        ))}
      </Tarjeta>
      {estaSolo ? <TarjetaInvitacion hogar={hogar} uid={usuario.uid} /> : null}
    </Pantalla>
  );
}
