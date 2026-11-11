import { PantallaEliminarCuenta } from '../../src/components/PantallaEliminarCuenta';

// Eliminar la cuenta sin pertenecer a ningún hogar.
export default function EliminarCuentaSinHogar() {
  return <PantallaEliminarCuenta hogar={null} />;
}
