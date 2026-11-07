import { BOM, campoCSV, generarCSV, nombreArchivoCSV } from '../csv';

const nombres = {
  nombreCategoria: (id) => ({ luz: 'Luz', super: 'Supermercado' })[id] ?? 'Sin categoría',
  nombreMiembro: (uid) => ({ ana: 'Ana', blas: 'Blas' })[uid] ?? 'Antiguo miembro',
};

describe('CSV para Excel', () => {
  test('BOM, separador ";", decimales con coma y fechas dd/mm/aaaa', () => {
    const csv = generarCSV(
      [
        { fecha: '2026-11-06', categoriaId: 'super', nota: 'Compra', importe: 123456, pagadoPor: null, creadoPor: 'blas' },
        { fecha: '2026-11-01', categoriaId: 'luz', nota: 'Factura', importe: 1250, pagadoPor: 'ana', creadoPor: 'ana' },
      ],
      nombres,
    );
    expect(csv.startsWith(BOM)).toBe(true);
    const lineas = csv.slice(1).split('\r\n');
    expect(lineas[0]).toBe('Fecha;Categoría;Nota;Importe (€);Pagado por;Apuntado por');
    // Ordenado de más antiguo a más reciente.
    expect(lineas[1]).toBe('01/11/2026;Luz;Factura;12,50;Ana;Ana');
    expect(lineas[2]).toBe('06/11/2026;Supermercado;Compra;1234,56;Sin indicar;Blas');
    expect(lineas[3]).toBe('');
  });

  test('escapa ";", comillas y saltos de línea; neutraliza fórmulas', () => {
    expect(campoCSV('a;b')).toBe('"a;b"');
    expect(campoCSV('dijo "hola"')).toBe('"dijo ""hola"""');
    expect(campoCSV('dos\nlíneas')).toBe('"dos\nlíneas"');
    expect(campoCSV('=SUMA(A1)')).toBe("'=SUMA(A1)");
    expect(campoCSV(null)).toBe('');
    expect(campoCSV('Ñandú')).toBe('Ñandú');
  });

  test('nombre del archivo sin tildes ni espacios', () => {
    expect(nombreArchivoCSV('Piso de Lavapiés', '2026-11')).toBe('control-casa_piso-de-lavapies_2026-11.csv');
    expect(nombreArchivoCSV('Casa', null)).toBe('control-casa_casa_todo.csv');
    expect(nombreArchivoCSV('¡¡!!', null)).toBe('control-casa_hogar_todo.csv');
  });
});
