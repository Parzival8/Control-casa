// Tests de navegación y pantallas con Expo Router (sin móvil ni Firebase).
// La capa de datos (src/data) se sustituye por versiones falsas, así se
// comprueba que cada situación lleva a la pantalla correcta y que se dibuja.
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import path from 'path';

// Estado "falso" de Firebase que cada test ajusta.
const falso = { usuario: null, perfil: null, hogar: null, errorHogar: null, gastos: [] };

jest.mock('../../src/data/auth', () => ({
  escucharSesion: (cb) => {
    cb(falso.usuario);
    return () => {};
  },
  iniciarSesion: jest.fn(() => Promise.reject({ code: 'auth/invalid-credential' })),
  registrar: jest.fn(),
  cerrarSesion: jest.fn(),
  recuperarContrasena: jest.fn(() => Promise.resolve()),
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
  escucharGasto: (hogarId, id, ok) => {
    ok(falso.gastos.find((g) => g.id === id) ?? null);
    return () => {};
  },
  crearGasto: jest.fn(() => 'nuevo'),
  editarGasto: jest.fn(),
  borrarGasto: jest.fn(),
}));

jest.mock('../../src/data/categorias', () => ({
  escucharCategorias: (hogarId, ok) => {
    ok([
      { id: 'luz', nombre: 'Luz', icono: '💡', color: '#f59e0b', archivada: false },
      { id: 'supermercado', nombre: 'Supermercado', icono: '🛒', color: '#22c55e', archivada: false },
      { id: 'vieja', nombre: 'Archivada', icono: '🗄️', color: '#000000', archivada: true },
    ]);
    return () => {};
  },
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
    expect(screen.getByText(`12,50${NBSP}€`)).toBeTruthy();
    // Sin nota se muestra la categoría.
    expect(screen.getByText('Supermercado')).toBeTruthy();
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
