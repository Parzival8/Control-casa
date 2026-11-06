// Tests de navegación y pantallas con Expo Router (sin móvil ni Firebase).
// La capa de datos (src/data) se sustituye por versiones falsas, así se
// comprueba que cada situación lleva a la pantalla correcta y que se dibuja.
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import path from 'path';

// Estado "falso" de Firebase que cada test ajusta.
const falso = { usuario: null, perfil: null, hogar: null };

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
  escucharHogar: (id, ok) => {
    ok(falso.hogar);
    return () => {};
  },
  leerCaducidadCodigo: () => Promise.resolve(new Date(2099, 0, 1)),
  crearHogar: jest.fn(),
  unirseConCodigo: jest.fn(() => Promise.reject({ code: 'app/codigo-caducado' })),
  regenerarCodigo: jest.fn(),
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

  test('muestra Inicio con los miembros', async () => {
    const app = await renderRouter(APP, { initialUrl: '/' });
    expect(app.getPathname()).toBe('/inicio');
    expect(screen.getByText('Gastos del mes')).toBeTruthy();
    expect(screen.getByText('En el hogar (2)')).toBeTruthy();
  });

  test('Ajustes muestra el código para compartir', async () => {
    await renderRouter(APP, { initialUrl: '/ajustes' });
    expect(screen.getByText('K7MP2XQA')).toBeTruthy();
    expect(await screen.findByText('Válido hasta el 01/01/2099.')).toBeTruthy();
    expect(screen.getByText('Compartir código')).toBeTruthy();
    expect(screen.getByText('Generar código nuevo')).toBeTruthy();
  });

  test('si te han quitado del hogar, lo explica', async () => {
    falso.hogar = null;
    await renderRouter(APP, { initialUrl: '/' });
    expect(screen.getByText('Ya no estás en este hogar')).toBeTruthy();
  });
});
