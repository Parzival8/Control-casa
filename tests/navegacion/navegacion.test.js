// Tests de navegación y pantallas con Expo Router (sin móvil ni Firebase).
// La capa de datos (src/data) se sustituye por versiones falsas, así se
// comprueba que cada situación lleva a la pantalla correcta y que se dibuja.
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import path from 'path';

// Estado "falso" de Firebase que cada test ajusta.
const falso = { usuario: null, perfil: null, hogar: null, errorHogar: null, gastos: [], recurrentes: [] };

jest.mock('../../src/data/auth', () => ({
  escucharSesion: (cb) => {
    cb(falso.usuario);
    return () => {};
  },
  iniciarSesion: jest.fn(() => Promise.reject({ code: 'auth/invalid-credential' })),
  registrar: jest.fn(),
  cerrarSesion: jest.fn(),
  recuperarContrasena: jest.fn(() => Promise.resolve()),
  eliminarCuenta: jest.fn(() => Promise.resolve()),
  cambiarNombreCuenta: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/data/gestionHogar', () => ({
  cambiarNombreHogar: jest.fn(() => Promise.resolve()),
  cambiarMiNombre: jest.fn(() => Promise.resolve()),
  expulsarMiembro: jest.fn(() => Promise.resolve()),
  salirDelHogar: jest.fn(() => Promise.resolve()),
  borrarHogar: jest.fn(() => Promise.resolve()),
  borrarMiNombreDeHogares: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/data/usuarios', () => ({
  escucharPerfil: (uid, ok) => {
    ok(falso.perfil);
    return () => {};
  },
  olvidarHogar: jest.fn(),
}));

jest.mock('../../src/data/hogares', () => ({
  escucharHogar: (id, ok, fallo) => {
    if (falso.errorHogar) fallo(falso.errorHogar);
    else ok(falso.hogar, { desdeCache: false });
    return () => {};
  },
  leerCaducidadCodigo: () => Promise.resolve(new Date(2099, 0, 1)),
  crearHogar: jest.fn(),
  unirseConCodigo: jest.fn(() => Promise.reject({ code: 'app/codigo-caducado' })),
  regenerarCodigo: jest.fn(),
}));

jest.mock('../../src/data/gastos', () => ({
  escucharGastosDelMes: (hogarId, mes, ok) => {
    ok(falso.gastos.filter((g) => g.fecha.startsWith(mes)));
    return () => {};
  },
  escucharGastosEntre: (hogarId, desde, hasta, ok) => {
    ok(falso.gastos.filter((g) => g.fecha.slice(0, 7) >= desde && g.fecha.slice(0, 7) <= hasta));
    return () => {};
  },
  escucharGasto: (hogarId, id, ok) => {
    ok(falso.gastos.find((g) => g.id === id) ?? null);
    return () => {};
  },
  crearGasto: jest.fn(() => 'nuevo'),
  editarGasto: jest.fn(),
  borrarGasto: jest.fn(),
}));

jest.mock('../../src/data/categorias', () => ({
  crearCategoria: jest.fn(() => 'nueva'),
  editarCategoria: jest.fn(),
  archivarCategoria: jest.fn(),
  borrarCategoria: jest.fn(),
  categoriaTieneGastos: jest.fn(() => Promise.resolve(false)),
  escucharCategorias: (hogarId, ok) => {
    ok([
      { id: 'luz', nombre: 'Luz', icono: '💡', color: '#f59e0b', archivada: false },
      { id: 'supermercado', nombre: 'Supermercado', icono: '🛒', color: '#22c55e', archivada: false },
      { id: 'vieja', nombre: 'Archivada', icono: '🗄️', color: '#000000', archivada: true },
    ]);
    return () => {};
  },
}));

jest.mock('../../src/data/recurrentes', () => ({
  escucharRecurrentes: (hogarId, ok) => {
    ok(falso.recurrentes);
    return () => {};
  },
  generarGastosFijos: jest.fn(() => Promise.resolve(0)),
  crearRecurrente: jest.fn(() => 'nuevo'),
  editarRecurrente: jest.fn(),
  borrarRecurrente: jest.fn(),
}));

jest.mock('../../src/data/exportar', () => ({
  leerTodosLosGastos: jest.fn(() => Promise.resolve(falso.gastos)),
  compartirCSV: jest.fn(() => Promise.resolve()),
}));

// Los gráficos dibujan con SVG nativo: en los tests se sustituyen por una caja vacía.
jest.mock('react-native-gifted-charts', () => ({
  PieChart: () => null,
  BarChart: () => null,
}));

jest.mock('@react-native-community/datetimepicker', () => ({
  DateTimePickerAndroid: { open: jest.fn() },
}));

const APP = path.join(__dirname, '../../app');

const ana = { uid: 'ana', email: 'ana@ejemplo.com', nombre: 'Ana' };
const hogar = {
  id: 'h1',
  nombre: 'Casa',
  creadoPor: 'ana',
  miembros: ['ana', 'blas'],
  miembrosInfo: { ana: { nombre: 'Ana' }, blas: { nombre: 'Blas' } },
  codigoInvitacion: 'K7MP2XQA',
};

beforeEach(() => {
  falso.usuario = null;
  falso.perfil = null;
  falso.hogar = null;
  falso.errorHogar = null;
  falso.gastos = [];
  falso.recurrentes = [];
  jest.clearAllMocks();
});

describe('sin sesión', () => {
  test('lleva a iniciar sesión', async () => {
    const app = await renderRouter(APP, { initialUrl: '/' });
    expect(app.getPathname()).toBe('/iniciar-sesion');
    expect(screen.getByText('Iniciar sesión')).toBeTruthy();
  });

  test('valida el formulario y traduce los errores', async () => {
    await renderRouter(APP, { initialUrl: '/' });
    await fireEvent.press(screen.getByText('Iniciar sesión'));
    expect(await screen.findByText('Escribe un email válido.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Email'), 'ana@ejemplo.com');
    await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'mala');
    await fireEvent.press(screen.getByText('Iniciar sesión'));
    expect(await screen.findByText('El email o la contraseña no son correctos.')).toBeTruthy();
  });

  test('se puede ir a crear cuenta y a recuperar contraseña', async () => {
    const app = await renderRouter(APP, { initialUrl: '/' });
    await fireEvent.press(screen.getByText('Crear una cuenta'));
    await waitFor(() => expect(app.getPathname()).toBe('/registro'));
    expect(screen.getByLabelText('Repite la contraseña')).toBeTruthy();
  });

  test('no se puede entrar a la app escribiendo la ruta', async () => {
    const app = await renderRouter(APP, { initialUrl: '/ajustes' });
    expect(app.getPathname()).toBe('/iniciar-sesion');
  });
});

describe('con sesión pero sin hogar', () => {
  beforeEach(() => {
    falso.usuario = ana;
    falso.perfil = { nombre: 'Ana', email: ana.email, hogarId: null };
  });

  test('ofrece crear hogar o unirse', async () => {
    const app = await renderRouter(APP, { initialUrl: '/' });
    expect(app.getPathname()).toBe('/sin-hogar');
    expect(screen.getByText('¡Hola, Ana!')).toBeTruthy();
    expect(screen.getByText('🏠  Crear hogar')).toBeTruthy();
    expect(screen.getByText('🔑  Unirme con código')).toBeTruthy();
  });

  test('unirse con un código caducado muestra el error en español', async () => {
    const app = await renderRouter(APP, { initialUrl: '/' });
    await fireEvent.press(screen.getByText('🔑  Unirme con código'));
    await waitFor(() => expect(app.getPathname()).toBe('/unirse'));
    await fireEvent.changeText(screen.getByLabelText('Código de invitación'), 'K7MP2XQA');
    await fireEvent.press(screen.getByText('Unirme'));
    expect(await screen.findByText(/Ese código ha caducado/)).toBeTruthy();
  });
});

describe('con hogar', () => {
  beforeEach(() => {
    falso.usuario = ana;
    falso.perfil = { nombre: 'Ana', email: ana.email, hogarId: 'h1' };
    falso.hogar = hogar;
  });

  test('Inicio sin gastos invita a apuntar el primero', async () => {
    const app = await renderRouter(APP, { initialUrl: '/' });
    expect(app.getPathname()).toBe('/inicio');
    expect(screen.getByText(/No hay gastos este mes/)).toBeTruthy();
    expect(screen.getByText('0 gastos')).toBeTruthy();
  });

  test('Ajustes muestra el código para compartir', async () => {
    await renderRouter(APP, { initialUrl: '/ajustes' });
    expect(screen.getByText('K7MP2XQA')).toBeTruthy();
    expect(await screen.findByText('Válido hasta el 01/01/2099.')).toBeTruthy();
    expect(screen.getByText('Compartir código')).toBeTruthy();
    expect(screen.getByText('Generar código nuevo')).toBeTruthy();
  });

  test('si el hogar ya no existe, lo explica', async () => {
    falso.hogar = null;
    await renderRouter(APP, { initialUrl: '/' });
    expect(screen.getByText('No se puede abrir el hogar')).toBeTruthy();
    expect(screen.getByText('Detalle: el hogar no existe')).toBeTruthy();
  });

  test('Ajustes muestra la versión de la app', async () => {
    await renderRouter(APP, { initialUrl: '/ajustes' });
    expect(screen.getByText(/^Versión .* · compilación /)).toBeTruthy();
  });

  test('un "sin permiso" puntual (recién creado) se reintenta antes de rendirse', async () => {
    falso.errorHogar = { code: 'firestore/permission-denied' };
    await renderRouter(APP, { initialUrl: '/' });
    // Primer error: aún no muestra el aviso, sigue esperando.
    expect(screen.queryByText('No se puede abrir el hogar')).toBeNull();
    // El servidor ya responde bien en el reintento.
    falso.errorHogar = null;
    await act(() => jest.advanceTimersByTime(2100));
    expect(await screen.findByText(/No hay gastos este mes/)).toBeTruthy();
  });

  test('si el "sin permiso" se repite, entonces sí avisa', async () => {
    falso.errorHogar = { code: 'firestore/permission-denied' };
    await renderRouter(APP, { initialUrl: '/' });
    for (let i = 0; i < 5; i++) await act(() => jest.advanceTimersByTime(2100));
    expect(await screen.findByText('No se puede abrir el hogar')).toBeTruthy();
    expect(screen.getByText('Detalle: firestore/permission-denied')).toBeTruthy();

    // "Reintentar" vuelve a intentarlo y, si ya hay acceso, entra.
    falso.errorHogar = null;
    await fireEvent.press(screen.getByText('Reintentar'));
    expect(await screen.findByText(/No hay gastos este mes/)).toBeTruthy();
  });
});

describe('gastos', () => {
  const NBSP = '\u00A0';
  const { mesActual } = require('../../src/utils/formato');
  const mes = mesActual();

  beforeEach(() => {
    falso.usuario = ana;
    falso.perfil = { nombre: 'Ana', email: ana.email, hogarId: 'h1' };
    falso.hogar = hogar;
    falso.gastos = [
      {
        id: 'g1', importe: 1250, categoriaId: 'luz', fecha: `${mes}-02`, nota: 'Factura',
        pagadoPor: 'blas', creadoPor: 'ana', editadoPor: 'ana', recurrenteId: null, creadoEn: null,
      },
      {
        id: 'g2', importe: 123456, categoriaId: 'supermercado', fecha: `${mes}-01`, nota: '',
        pagadoPor: null, creadoPor: 'ana', editadoPor: 'ana', recurrenteId: null, creadoEn: null,
      },
    ];
  });

  test('Inicio muestra el total del mes y la lista', async () => {
    await renderRouter(APP, { initialUrl: '/' });
    expect(screen.getByText(`1.247,06${NBSP}€`)).toBeTruthy();
    expect(screen.getByText('2 gastos')).toBeTruthy();
    expect(screen.getByText('Factura')).toBeTruthy();
    // En la lista y en el resumen por categoría.
    expect(screen.getAllByText(`12,50${NBSP}€`)).toHaveLength(2);
    // Sin nota se muestra la categoría.
    expect(screen.getByText('Supermercado')).toBeTruthy();
  });

  test('el resumen por categoría aparece con sus importes', async () => {
    await renderRouter(APP, { initialUrl: '/' });
    expect(screen.getByText('Por categoría')).toBeTruthy();
    expect(screen.getByText('🛒 Supermercado')).toBeTruthy();
    expect(screen.getByText('💡 Luz')).toBeTruthy();
  });

  test('tocar una categoría del resumen filtra la lista', async () => {
    await renderRouter(APP, { initialUrl: '/' });
    await fireEvent.press(screen.getByText('💡 Luz'));
    expect(await screen.findByText(`Mostrando 1 de 2 · 12,50${NBSP}€`)).toBeTruthy();
    await fireEvent.press(screen.getByText('Quitar filtros'));
    expect(screen.queryByText(/Mostrando/)).toBeNull();
  });

  test('filtrar por quién pagó, incluido "Sin indicar"', async () => {
    await renderRouter(APP, { initialUrl: '/' });
    await fireEvent.press(screen.getByText('Filtrar gastos'));
    await fireEvent.press(screen.getByLabelText('Sin indicar'));
    expect(await screen.findByText(`Mostrando 1 de 2 · 1.234,56${NBSP}€`)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Blas'));
    expect(await screen.findByText(`Mostrando 1 de 2 · 12,50${NBSP}€`)).toBeTruthy();
  });

  test('cambiar al mes anterior (sin gastos) pone el total a cero', async () => {
    await renderRouter(APP, { initialUrl: '/' });
    await fireEvent.press(screen.getByLabelText('Mes anterior'));
    expect(await screen.findByText(`0,00${NBSP}€`)).toBeTruthy();
  });

  test('apuntar un gasto: pagado por es opcional (sin indicar por defecto)', async () => {
    const { crearGasto } = require('../../src/data/gastos');
    const app = await renderRouter(APP, { initialUrl: '/' });
    await fireEvent.press(screen.getByLabelText('Apuntar gasto'));
    await waitFor(() => expect(app.getPathname()).toBe('/gasto/nuevo'));

    // La categoría archivada no se ofrece.
    expect(screen.queryByText('Archivada')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Importe (€)'), '45,90');
    await fireEvent.press(screen.getByLabelText('Supermercado'));
    await fireEvent.press(screen.getByText('Guardar'));

    expect(crearGasto).toHaveBeenCalledWith(
      expect.objectContaining({
        hogarId: 'h1',
        uid: 'ana',
        datos: expect.objectContaining({ importe: 4590, categoriaId: 'supermercado', pagadoPor: null }),
      }),
    );
    await waitFor(() => expect(app.getPathname()).toBe('/inicio'));
  });

  test('se puede indicar quién pagó', async () => {
    const { crearGasto } = require('../../src/data/gastos');
    await renderRouter(APP, { initialUrl: '/gasto/nuevo' });
    await fireEvent.changeText(screen.getByLabelText('Importe (€)'), '10');
    await fireEvent.press(screen.getByLabelText('Luz'));
    await fireEvent.press(screen.getByLabelText('Blas'));
    await fireEvent.press(screen.getByText('Guardar'));
    expect(crearGasto.mock.calls[0][0].datos).toEqual(
      expect.objectContaining({ importe: 1000, categoriaId: 'luz', pagadoPor: 'blas' }),
    );
  });

  test('sin importe o sin categoría avisa y no guarda', async () => {
    const { crearGasto } = require('../../src/data/gastos');
    await renderRouter(APP, { initialUrl: '/gasto/nuevo' });
    await fireEvent.press(screen.getByText('Guardar'));
    expect(await screen.findByText('Escribe un importe mayor que cero.')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Importe (€)'), '3,20');
    await fireEvent.press(screen.getByText('Guardar'));
    expect(await screen.findByText('Elige una categoría.')).toBeTruthy();
    expect(crearGasto).not.toHaveBeenCalled();
  });

  test('editar un gasto existente', async () => {
    const { editarGasto } = require('../../src/data/gastos');
    await renderRouter(APP, { initialUrl: '/gasto/g1' });
    expect(screen.getByDisplayValue('12,50')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Importe (€)'), '13,75');
    await fireEvent.press(screen.getByText('Guardar'));
    expect(editarGasto.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        gastoId: 'g1',
        uid: 'ana',
        datos: expect.objectContaining({ importe: 1375, categoriaId: 'luz', pagadoPor: 'blas', nota: 'Factura' }),
      }),
    );
  });

  test('eliminar pide confirmación', async () => {
    const { Alert } = require('react-native');
    const { borrarGasto } = require('../../src/data/gastos');
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation((titulo, mensaje, botones) => {
      botones.find((b) => b.text === 'Eliminar').onPress();
    });
    await renderRouter(APP, { initialUrl: '/gasto/g1' });
    await fireEvent.press(screen.getByText('Eliminar gasto'));
    expect(alerta).toHaveBeenCalledWith('¿Eliminar este gasto?', expect.any(String), expect.any(Array));
    expect(borrarGasto).toHaveBeenCalledWith(expect.objectContaining({ hogarId: 'h1', gastoId: 'g1' }));
    alerta.mockRestore();
  });

  test('si el gasto ya no existe, lo dice', async () => {
    await renderRouter(APP, { initialUrl: '/gasto/no-existe' });
    expect(screen.getByText('Este gasto ya no existe')).toBeTruthy();
  });
});

describe('categorías', () => {
  beforeEach(() => {
    falso.usuario = ana;
    falso.perfil = { nombre: 'Ana', email: ana.email, hogarId: 'h1' };
    falso.hogar = hogar;
  });

  test('la pestaña muestra las activas y oculta las archivadas', async () => {
    await renderRouter(APP, { initialUrl: '/categorias' });
    expect(screen.getByText('Luz')).toBeTruthy();
    expect(screen.queryByText('Archivada')).toBeNull();
    await fireEvent.press(screen.getByText('Ver archivadas (1)'));
    expect(screen.getByText('Archivada')).toBeTruthy();
  });

  test('crear una categoría con presupuesto', async () => {
    const { crearCategoria } = require('../../src/data/categorias');
    const app = await renderRouter(APP, { initialUrl: '/categorias' });
    await fireEvent.press(screen.getByText('+  Nueva categoría'));
    await waitFor(() => expect(app.getPathname()).toBe('/categoria/nueva'));
    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Mascotas');
    await fireEvent.press(screen.getByLabelText('Icono 🐶'));
    await fireEvent.changeText(screen.getByLabelText('Presupuesto mensual en € (opcional)'), '50');
    await fireEvent.press(screen.getByText('Guardar'));
    expect(crearCategoria).toHaveBeenCalledWith(
      expect.objectContaining({
        hogarId: 'h1',
        datos: expect.objectContaining({ nombre: 'Mascotas', icono: '🐶', presupuestoMensual: 5000 }),
      }),
    );
  });

  test('no deja repetir el nombre de otra categoría', async () => {
    const { crearCategoria } = require('../../src/data/categorias');
    await renderRouter(APP, { initialUrl: '/categoria/nueva' });
    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'luz');
    await fireEvent.press(screen.getByText('Guardar'));
    expect(await screen.findByText('Ya hay una categoría con ese nombre.')).toBeTruthy();
    expect(crearCategoria).not.toHaveBeenCalled();
  });

  test('archivar una categoría', async () => {
    const { archivarCategoria } = require('../../src/data/categorias');
    await renderRouter(APP, { initialUrl: '/categoria/luz' });
    await fireEvent.press(screen.getByText('Archivar categoría'));
    expect(archivarCategoria).toHaveBeenCalledWith(
      expect.objectContaining({ categoriaId: 'luz', archivada: true }),
    );
  });

  test('una categoría con gastos no se elimina: propone archivarla', async () => {
    const { Alert } = require('react-native');
    const datos = require('../../src/data/categorias');
    datos.categoriaTieneGastos.mockResolvedValueOnce(true);
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await renderRouter(APP, { initialUrl: '/categoria/luz' });
    await fireEvent.press(screen.getByText('Eliminar categoría'));
    await waitFor(() => expect(alerta).toHaveBeenCalled());
    expect(alerta.mock.calls[0][0]).toBe('Esta categoría tiene gastos');
    expect(datos.borrarCategoria).not.toHaveBeenCalled();
    alerta.mockRestore();
  });

  test('una categoría sin gastos se elimina tras confirmar', async () => {
    const { Alert } = require('react-native');
    const datos = require('../../src/data/categorias');
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation((t, m, botones) => {
      botones.find((b) => b.text === 'Eliminar')?.onPress();
    });
    await renderRouter(APP, { initialUrl: '/categoria/luz' });
    await fireEvent.press(screen.getByText('Eliminar categoría'));
    await waitFor(() => expect(datos.borrarCategoria).toHaveBeenCalled());
    expect(alerta.mock.calls[0][0]).toBe('¿Eliminar «Luz»?');
    alerta.mockRestore();
  });
});

describe('estadísticas', () => {
  const NBSP = '\u00A0';
  const { mesActual } = require('../../src/utils/formato');
  const { sumarMeses } = require('../../src/utils/meses');
  const mes = mesActual();
  const gasto = (id, fecha, importe, pagadoPor, categoriaId = 'luz') => ({
    id, importe, categoriaId, fecha, nota: '', pagadoPor,
    creadoPor: 'ana', editadoPor: 'ana', recurrenteId: null, creadoEn: null,
  });

  beforeEach(() => {
    falso.usuario = ana;
    falso.perfil = { nombre: 'Ana', email: ana.email, hogarId: 'h1' };
    falso.hogar = hogar;
  });

  test('sin gastos muestra estados vacíos amables', async () => {
    await renderRouter(APP, { initialUrl: '/estadisticas' });
    expect(screen.getByText(/Este mes todavía no hay gastos/)).toBeTruthy();
    expect(screen.getByText('Aún no hay gastos en el último año.')).toBeTruthy();
    expect(screen.getByText('✅ Estáis en paz: nadie debe nada.')).toBeTruthy();
  });

  test('total, comparación, media y reparto con "Sin indicar" aparte', async () => {
    falso.gastos = [
      gasto('a', `${mes}-01`, 10000, 'ana'),
      gasto('b', `${mes}-02`, 4000, 'blas', 'supermercado'),
      gasto('c', `${mes}-03`, 500, null),
      gasto('d', `${sumarMeses(mes, -1)}-15`, 10000, 'ana'),
    ];
    await renderRouter(APP, { initialUrl: '/estadisticas' });

    // Total del mes (14.500) y +45 % respecto a los 10.000 del mes anterior.
    expect(screen.getAllByText(`145,00${NBSP}€`).length).toBeGreaterThan(0);
    expect(screen.getByText(/\+45,00.€ \(\+45 %\)/)).toBeTruthy();
    // Media de los 2 meses con gasto: (145 + 100) / 2 = 122,50.
    expect(screen.getByText(`122,50${NBSP}€`)).toBeTruthy();
    // Reparto: 140 € entre 2 -> 70 cada uno; Blas pagó 40, debe 30 a Ana (que soy yo).
    expect(screen.getByText(`💸 Blas te debe 30,00${NBSP}€`)).toBeTruthy();
    expect(screen.getByText(/No cuentan 5,00.€ de gastos sin «Pagado por»/)).toBeTruthy();
  });
});

describe('Fase 5: gastos fijos, presupuestos y exportar', () => {
  const NBSP = ' ';
  const { mesActual } = require('../../src/utils/formato');
  const mes = mesActual();

  beforeEach(() => {
    falso.usuario = ana;
    falso.perfil = { nombre: 'Ana', email: ana.email, hogarId: 'h1' };
    falso.hogar = hogar;
  });

  test('al abrir la app se intentan apuntar los gastos fijos', async () => {
    const { generarGastosFijos } = require('../../src/data/recurrentes');
    await renderRouter(APP, { initialUrl: '/' });
    expect(generarGastosFijos).toHaveBeenCalledWith(
      expect.objectContaining({ hogarId: 'h1', uid: 'ana', miembros: ['ana', 'blas'] }),
    );
  });

  test('desde Ajustes se llega a los gastos fijos y se crea uno', async () => {
    const { crearRecurrente } = require('../../src/data/recurrentes');
    const app = await renderRouter(APP, { initialUrl: '/ajustes' });
    await fireEvent.press(screen.getByText('🔁  Gastos fijos'));
    await waitFor(() => expect(app.getPathname()).toBe('/fijos'));
    expect(screen.getByText(/Aún no hay gastos fijos/)).toBeTruthy();

    await fireEvent.press(screen.getByText('+  Nuevo gasto fijo'));
    await waitFor(() => expect(app.getPathname()).toBe('/fijos/nuevo'));
    await fireEvent.changeText(screen.getByLabelText('Importe (€)'), '700');
    await fireEvent.changeText(screen.getByLabelText('Día del mes (1 a 28)'), '5');
    await fireEvent.press(screen.getByLabelText('Luz'));
    await fireEvent.changeText(screen.getByLabelText('Nota (opcional)'), 'Alquiler');
    await fireEvent.press(screen.getByText('Guardar'));
    expect(crearRecurrente).toHaveBeenCalledWith(
      expect.objectContaining({
        hogarId: 'h1',
        datos: expect.objectContaining({
          importe: 70000,
          diaDelMes: 5,
          categoriaId: 'luz',
          nota: 'Alquiler',
          pagadoPor: null,
          activo: true,
        }),
      }),
    );
  });

  test('un día fuera de 1-28 no se acepta', async () => {
    const { crearRecurrente } = require('../../src/data/recurrentes');
    await renderRouter(APP, { initialUrl: '/fijos/nuevo' });
    await fireEvent.changeText(screen.getByLabelText('Importe (€)'), '10');
    await fireEvent.changeText(screen.getByLabelText('Día del mes (1 a 28)'), '31');
    await fireEvent.press(screen.getByLabelText('Luz'));
    await fireEvent.press(screen.getByText('Guardar'));
    expect(await screen.findByText('El día debe estar entre 1 y 28.')).toBeTruthy();
    expect(crearRecurrente).not.toHaveBeenCalled();
  });

  test('la lista muestra los fijos con su día', async () => {
    falso.recurrentes = [
      { id: 'r1', importe: 70000, categoriaId: 'luz', diaDelMes: 1, nota: 'Alquiler', pagadoPor: null, activo: true, ultimoMesGenerado: null },
      { id: 'r2', importe: 3000, categoriaId: 'luz', diaDelMes: 10, nota: 'Internet', pagadoPor: null, activo: false, ultimoMesGenerado: null },
    ];
    await renderRouter(APP, { initialUrl: '/fijos' });
    expect(screen.getByText('Alquiler')).toBeTruthy();
    expect(screen.getByText('Día 1 de cada mes')).toBeTruthy();
    expect(screen.getByText('Día 10 de cada mes · en pausa')).toBeTruthy();
  });

  test('presupuestos: aviso y superado en Inicio', async () => {
    const categorias = require('../../src/data/categorias');
    const original = categorias.escucharCategorias;
    categorias.escucharCategorias = (hogarId, ok) => {
      ok([
        { id: 'luz', nombre: 'Luz', icono: '💡', color: '#f59e0b', archivada: false, presupuestoMensual: 5000 },
        { id: 'supermercado', nombre: 'Supermercado', icono: '🛒', color: '#22c55e', archivada: false, presupuestoMensual: 10000 },
      ]);
      return () => {};
    };
    const g = (id, categoriaId, importe) => ({
      id, importe, categoriaId, fecha: `${mes}-01`, nota: '', pagadoPor: null,
      creadoPor: 'ana', editadoPor: 'ana', recurrenteId: null, creadoEn: null,
    });
    falso.gastos = [g('a', 'luz', 6000), g('b', 'supermercado', 8500)];
    await renderRouter(APP, { initialUrl: '/' });
    expect(screen.getByText('Presupuestos del mes')).toBeTruthy();
    expect(screen.getByText(`120 % · Superado en 10,00${NBSP}€`)).toBeTruthy();
    expect(screen.getByText(`85 % · Quedan 15,00${NBSP}€`)).toBeTruthy();
    categorias.escucharCategorias = original;
  });

  test('exportar un mes genera el CSV y abre compartir', async () => {
    const { compartirCSV } = require('../../src/data/exportar');
    falso.gastos = [
      { id: 'a', importe: 1250, categoriaId: 'luz', fecha: `${mes}-02`, nota: 'Factura', pagadoPor: 'blas', creadoPor: 'ana' },
    ];
    await renderRouter(APP, { initialUrl: '/exportar' });
    await fireEvent.press(screen.getByText('Exportar este mes'));
    await waitFor(() => expect(compartirCSV).toHaveBeenCalled());
    const [nombre, contenido] = compartirCSV.mock.calls[0];
    expect(nombre).toBe(`control-casa_casa_${mes}.csv`);
    expect(contenido).toContain(';Luz;Factura;12,50;Blas;Ana');
  });

  test('exportar sin gastos avisa y no comparte nada', async () => {
    const { compartirCSV } = require('../../src/data/exportar');
    await renderRouter(APP, { initialUrl: '/exportar' });
    await fireEvent.press(screen.getByText('Exportar todos los gastos'));
    expect(await screen.findByText('Todavía no hay gastos que exportar.')).toBeTruthy();
    expect(compartirCSV).not.toHaveBeenCalled();
  });
});

describe('Fase 6: gestión del hogar y de la cuenta', () => {
  const { Alert } = require('react-native');
  const datos = () => require('../../src/data/gestionHogar');
  /** Pulsa el botón indicado del aviso de confirmación. */
  const confirmarCon = (texto) =>
    jest.spyOn(Alert, 'alert').mockImplementation((t, m, botones) => {
      botones?.find((b) => b.text === texto)?.onPress?.();
    });

  beforeEach(() => {
    falso.usuario = ana;
    falso.perfil = { nombre: 'Ana', email: ana.email, hogarId: 'h1', hogaresAnteriores: ['viejo'] };
    falso.hogar = hogar; // ana es la creadora; blas es miembro
  });

  afterEach(() => jest.restoreAllMocks());

  test('el creador ve "Quitar" junto a los demás y puede expulsar', async () => {
    confirmarCon('Quitar');
    await renderRouter(APP, { initialUrl: '/ajustes' });
    expect(screen.getAllByLabelText('Quitar')).toHaveLength(1); // no junto a sí mismo
    await fireEvent.press(screen.getByLabelText('Quitar'));
    expect(datos().expulsarMiembro).toHaveBeenCalledWith({ hogarId: 'h1', uidExpulsado: 'blas' });
  });

  test('un miembro normal no ve "Quitar" ni "Borrar el hogar"', async () => {
    falso.usuario = { uid: 'blas', email: 'blas@ejemplo.com', nombre: 'Blas' };
    falso.perfil = { nombre: 'Blas', email: 'blas@ejemplo.com', hogarId: 'h1' };
    await renderRouter(APP, { initialUrl: '/ajustes' });
    expect(screen.queryByLabelText('Quitar')).toBeNull();
    expect(screen.queryByText('Borrar el hogar')).toBeNull();
    expect(screen.getByText('Salir del hogar')).toBeTruthy();
  });

  test('el creador sale dejando el hogar al miembro elegido', async () => {
    confirmarCon('Salir');
    await renderRouter(APP, { initialUrl: '/hogar/salir' });
    expect(screen.getByText('¿A quién dejas el hogar?')).toBeTruthy();
    await fireEvent.press(screen.getByText('Salir del hogar'));
    expect(datos().salirDelHogar).toHaveBeenCalledWith({ hogarId: 'h1', uid: 'ana', sucesor: 'blas' });
  });

  test('un miembro normal sale sin traspasar nada', async () => {
    confirmarCon('Salir');
    falso.usuario = { uid: 'blas', email: 'blas@ejemplo.com', nombre: 'Blas' };
    falso.perfil = { nombre: 'Blas', email: 'blas@ejemplo.com', hogarId: 'h1' };
    await renderRouter(APP, { initialUrl: '/hogar/salir' });
    expect(screen.queryByText('¿A quién dejas el hogar?')).toBeNull();
    await fireEvent.press(screen.getByText('Salir del hogar'));
    expect(datos().salirDelHogar).toHaveBeenCalledWith({ hogarId: 'h1', uid: 'blas', sucesor: null });
  });

  test('si el creador está solo, para salir tiene que borrar el hogar', async () => {
    falso.hogar = { ...hogar, miembros: ['ana'] };
    await renderRouter(APP, { initialUrl: '/hogar/salir' });
    expect(screen.getByText(/Eres la única persona del hogar/)).toBeTruthy();
  });

  test('borrar el hogar exige escribir su nombre y confirmar', async () => {
    confirmarCon('Borrar');
    await renderRouter(APP, { initialUrl: '/hogar/borrar' });
    await fireEvent.press(screen.getByText('Borrar el hogar'));
    expect(datos().borrarHogar).not.toHaveBeenCalled(); // botón desactivado
    await fireEvent.changeText(screen.getByLabelText('Escribe «Casa» para confirmar'), 'casa');
    await fireEvent.press(screen.getByText('Borrar el hogar'));
    await waitFor(() => expect(datos().borrarHogar).toHaveBeenCalled());
  });

  test('cambiar el nombre del hogar y el propio', async () => {
    const app = await renderRouter(APP, { initialUrl: '/ajustes' });
    await fireEvent.press(screen.getByLabelText('Cambiar nombre'));
    await waitFor(() => expect(app.getPathname()).toBe('/editar-nombre'));
    await fireEvent.changeText(screen.getByLabelText('Nombre del hogar'), 'Casa nueva');
    await fireEvent.press(screen.getByText('Guardar'));
    await waitFor(() =>
      expect(datos().cambiarNombreHogar).toHaveBeenCalledWith({ hogarId: 'h1', nombre: 'Casa nueva' }),
    );
  });

  test('eliminar la cuenta pide contraseña, quién hereda el hogar y confirmación', async () => {
    const { eliminarCuenta } = require('../../src/data/auth');
    confirmarCon('Eliminar mi cuenta');
    await renderRouter(APP, { initialUrl: '/cuenta/eliminar' });
    expect(screen.getByText('¿A quién dejas el hogar?')).toBeTruthy();
    await fireEvent.press(screen.getByText('Eliminar mi cuenta'));
    expect(await screen.findByText('Escribe tu contraseña.')).toBeTruthy();
    expect(eliminarCuenta).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Tu contraseña (para confirmar)'), 'secreta1');
    await fireEvent.press(screen.getByText('Eliminar mi cuenta'));
    await waitFor(() => expect(eliminarCuenta).toHaveBeenCalled());
    expect(eliminarCuenta.mock.calls[0][0]).toEqual(
      expect.objectContaining({ contrasena: 'secreta1', sucesor: 'blas', hogar: expect.objectContaining({ id: 'h1' }) }),
    );
  });

  test('sin hogar también se puede eliminar la cuenta', async () => {
    falso.perfil = { nombre: 'Ana', email: ana.email, hogarId: null };
    const app = await renderRouter(APP, { initialUrl: '/' });
    await fireEvent.press(screen.getByText('Eliminar mi cuenta'));
    await waitFor(() => expect(app.getPathname()).toBe('/eliminar-cuenta'));
    expect(screen.queryByText('¿A quién dejas el hogar?')).toBeNull();
  });
});
