import { PantallaEliminarCuenta } from '../../../src/components/PantallaEliminarCuenta';
import { useHogarActual } from '../../../src/hooks/useHogarActual';

export default function EliminarCuenta() {
  return <PantallaEliminarCuenta hogar={useHogarActual()} />;
}
