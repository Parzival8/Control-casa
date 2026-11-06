// Tests de las reglas de seguridad (firestore.rules) contra el emulador.
// Ejecutar con: npm run test:rules
//
// Personajes:
//   ana   -> crea el hogar "h1" (creadora)
//   blas  -> miembro de h1
//   carla -> no es miembro de nada (intenta unirse o colarse)

const fs = require('fs');
const path = require('path');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  Timestamp,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  setLogLevel,
  updateDoc,
  writeBatch,
} = require('firebase/firestore');

const CODIGO = 'ABCD2345';
const CODIGO_NUEVO = 'WXYZ6789';
const UN_DIA = 24 * 60 * 60 * 1000;

let entorno;

// Los rechazos esperados llenarían la consola de avisos: se silencian.
setLogLevel('silent');

/** Firestore como un usuario con sesión iniciada. */
function como(uid) {
  return entorno.authenticatedContext(uid, { email: `${uid}@ejemplo.com` }).firestore();
}

/** Firestore sin sesión. */
function anonimo() {
  return entorno.unauthenticatedContext().firestore();
}

function enDias(dias) {
  return Timestamp.fromMillis(Date.now() + dias * UN_DIA);
}

function gastoValido(uid, extra = {}) {
  return {
    importe: 1250,
    categoriaId: 'luz',
    fecha: '2026-11-06',
    nota: 'Factura',
    pagadoPor: uid,
    creadoPor: uid,
    editadoPor: uid,
    recurrenteId: null,
    creadoEn: serverTimestamp(),
    editadoEn: serverTimestamp(),
    ...extra,
  };
}

/** Prepara datos de partida saltándose las reglas. */
async function sembrar({ expiraEn = enDias(7), miembros = ['ana', 'blas'] } = {}) {
  await entorno.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const info = {};
    for (const m of miembros) info[m] = { nombre: m.toUpperCase() };
    await setDoc(doc(db, 'hogares/h1'), {
      nombre: 'Casa',
      creadoPor: 'ana',
      miembros,
      miembrosInfo: info,
      codigoInvitacion: CODIGO,
      creadoEn: Timestamp.now(),
    });
    await setDoc(doc(db, `invitaciones/${CODIGO}`), {
      hogarId: 'h1',
      creadoPor: 'ana',
      expiraEn,
    });
    await setDoc(doc(db, 'hogares/h1/gastos/g1'), {
      importe: 500,
      categoriaId: 'luz',
      fecha: '2026-11-01',
      nota: '',
      pagadoPor: 'ana',
      creadoPor: 'ana',
      editadoPor: 'ana',
      recurrenteId: null,
      creadoEn: Timestamp.now(),
      editadoEn: Timestamp.now(),
    });
    await setDoc(doc(db, 'hogares/h1/categorias/luz'), {
      nombre: 'Luz',
      icono: '💡',
      color: '#f59e0b',
      presupuestoMensual: null,
      archivada: false,
    });
    for (const uid of ['ana', 'blas', 'carla']) {
      await setDoc(doc(db, `users/${uid}`), {
        nombre: uid.toUpperCase(),
        email: `${uid}@ejemplo.com`,
        hogarId: uid === 'carla' ? null : 'h1',
        creadoEn: Timestamp.now(),
      });
    }
  });
}

/** Escritura con la que carla intenta unirse a h1. */
function unirse(db, uid = 'carla', codigo = CODIGO, extra = {}) {
  return updateDoc(doc(db, 'hogares/h1'), {
    miembros: arrayUnion(uid),
    [`miembrosInfo.${uid}`]: { nombre: 'Carla', codigoUsado: codigo },
    ...extra,
  });
}

beforeAll(async () => {
  entorno = await initializeTestEnvironment({
    projectId: 'demo-control-casa',
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, '../../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await entorno.cleanup();
});

beforeEach(async () => {
  await entorno.clearFirestore();
});

describe('sin sesión iniciada', () => {
  beforeEach(() => sembrar());

  test('no puede leer ni escribir nada', async () => {
    const db = anonimo();
    await assertFails(getDoc(doc(db, 'hogares/h1')));
    await assertFails(getDoc(doc(db, 'users/ana')));
    await assertFails(getDoc(doc(db, `invitaciones/${CODIGO}`)));
    await assertFails(getDocs(collection(db, 'hogares/h1/gastos')));
    await assertFails(setDoc(doc(db, 'hogares/h2'), { nombre: 'X' }));
  });
});

describe('users/{uid}', () => {
  beforeEach(() => sembrar());

  test('cada usuario lee y edita solo su documento', async () => {
    await assertSucceeds(getDoc(doc(como('ana'), 'users/ana')));
    await assertFails(getDoc(doc(como('carla'), 'users/ana')));
    await assertSucceeds(updateDoc(doc(como('ana'), 'users/ana'), { nombre: 'Ana María' }));
    await assertFails(updateDoc(doc(como('carla'), 'users/ana'), { nombre: 'Hackeada' }));
  });

  test('crear el perfil exige campos correctos y su propio email', async () => {
    const db = como('dani');
    await assertFails(
      setDoc(doc(db, 'users/dani'), {
        nombre: 'Dani',
        email: 'otro@ejemplo.com',
        hogarId: null,
        creadoEn: serverTimestamp(),
      }),
    );
    await assertFails(
      setDoc(doc(db, 'users/dani'), {
        nombre: 'Dani',
        email: 'dani@ejemplo.com',
        hogarId: null,
        creadoEn: serverTimestamp(),
        admin: true,
      }),
    );
    await assertSucceeds(
      setDoc(doc(db, 'users/dani'), {
        nombre: 'Dani',
        email: 'dani@ejemplo.com',
        hogarId: null,
        creadoEn: serverTimestamp(),
      }),
    );
  });

  test('no se puede cambiar la fecha de creación', async () => {
    await assertFails(updateDoc(doc(como('ana'), 'users/ana'), { creadoEn: serverTimestamp() }));
  });
});

describe('crear un hogar', () => {
  /** Lo que hace la app: hogar + invitación + perfil + categorías, todo junto. */
  function crearHogar(db, uid, { codigoHogar = CODIGO, codigoInvitacion = CODIGO } = {}) {
    const lote = writeBatch(db);
    lote.set(doc(db, 'hogares/nuevo'), {
      nombre: 'Piso',
      creadoPor: uid,
      miembros: [uid],
      miembrosInfo: { [uid]: { nombre: 'Dani' } },
      codigoInvitacion: codigoHogar,
      creadoEn: serverTimestamp(),
    });
    lote.set(doc(db, `invitaciones/${codigoInvitacion}`), {
      hogarId: 'nuevo',
      creadoPor: uid,
      expiraEn: enDias(7),
    });
    lote.update(doc(db, `users/${uid}`), { hogarId: 'nuevo' });
    // Las 15 categorías iniciales, como en la app.
    for (let i = 1; i <= 15; i++) {
      const id = `categoria${i}`;
      lote.set(doc(db, `hogares/nuevo/categorias/${id}`), {
        nombre: id,
        icono: '📦',
        color: '#94a3b8',
        presupuestoMensual: null,
        archivada: false,
      });
    }
    return lote.commit();
  }

  beforeEach(async () => {
    await entorno.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/dani'), {
        nombre: 'Dani',
        email: 'dani@ejemplo.com',
        hogarId: null,
        creadoEn: Timestamp.now(),
      });
    });
  });

  test('hogar, invitación, perfil y categorías en un solo lote', async () => {
    await assertSucceeds(crearHogar(como('dani'), 'dani'));
  });

  test('el código del hogar y el de la invitación deben coincidir', async () => {
    await assertFails(crearHogar(como('dani'), 'dani', { codigoInvitacion: CODIGO_NUEVO }));
  });

  test('no se puede crear un hogar en nombre de otro', async () => {
    const db = como('dani');
    await assertFails(
      setDoc(doc(db, 'hogares/x'), {
        nombre: 'Piso',
        creadoPor: 'ana',
        miembros: ['ana'],
        miembrosInfo: { ana: { nombre: 'Ana' } },
        codigoInvitacion: CODIGO,
        creadoEn: serverTimestamp(),
      }),
    );
  });

  test('no se puede crear un hogar con más miembros que uno mismo', async () => {
    const db = como('dani');
    const lote = writeBatch(db);
    lote.set(doc(db, 'hogares/nuevo'), {
      nombre: 'Piso',
      creadoPor: 'dani',
      miembros: ['dani', 'ana'],
      miembrosInfo: { dani: { nombre: 'Dani' } },
      codigoInvitacion: CODIGO,
      creadoEn: serverTimestamp(),
    });
    lote.set(doc(db, `invitaciones/${CODIGO}`), {
      hogarId: 'nuevo',
      creadoPor: 'dani',
      expiraEn: enDias(7),
    });
    await assertFails(lote.commit());
  });

  test('la invitación no puede durar más de 7 días', async () => {
    const db = como('dani');
    const lote = writeBatch(db);
    lote.set(doc(db, 'hogares/nuevo'), {
      nombre: 'Piso',
      creadoPor: 'dani',
      miembros: ['dani'],
      miembrosInfo: { dani: { nombre: 'Dani' } },
      codigoInvitacion: CODIGO,
      creadoEn: serverTimestamp(),
    });
    lote.set(doc(db, `invitaciones/${CODIGO}`), {
      hogarId: 'nuevo',
      creadoPor: 'dani',
      expiraEn: enDias(30),
    });
    await assertFails(lote.commit());
  });

  test('un código ya usado no se puede reutilizar (la invitación existe)', async () => {
    await sembrar();
    await assertFails(crearHogar(como('dani'), 'dani'));
  });
});

describe('acceso a un hogar ajeno', () => {
  beforeEach(() => sembrar());

  test('un no miembro no puede leer el hogar ni sus datos', async () => {
    const db = como('carla');
    await assertFails(getDoc(doc(db, 'hogares/h1')));
    await assertFails(getDocs(collection(db, 'hogares/h1/gastos')));
    await assertFails(getDoc(doc(db, 'hogares/h1/gastos/g1')));
    await assertFails(getDocs(collection(db, 'hogares/h1/categorias')));
    await assertFails(getDocs(collection(db, 'hogares/h1/recurrentes')));
  });

  test('un no miembro no puede escribir en el hogar ni en sus datos', async () => {
    const db = como('carla');
    await assertFails(updateDoc(doc(db, 'hogares/h1'), { nombre: 'Mío' }));
    await assertFails(setDoc(doc(db, 'hogares/h1/gastos/g2'), gastoValido('carla')));
    await assertFails(deleteDoc(doc(db, 'hogares/h1/gastos/g1')));
    await assertFails(
      setDoc(doc(db, 'hogares/h1/categorias/nueva'), {
        nombre: 'Nueva',
        icono: '📦',
        color: '#000000',
        presupuestoMensual: null,
        archivada: false,
      }),
    );
    await assertFails(deleteDoc(doc(db, 'hogares/h1')));
  });

  test('los miembros sí pueden leer', async () => {
    await assertSucceeds(getDoc(doc(como('blas'), 'hogares/h1')));
    await assertSucceeds(getDocs(collection(como('blas'), 'hogares/h1/gastos')));
  });
});

describe('invitaciones', () => {
  beforeEach(() => sembrar());

  test('se leen por código exacto pero no se pueden listar', async () => {
    await assertSucceeds(getDoc(doc(como('carla'), `invitaciones/${CODIGO}`)));
    await assertFails(getDocs(collection(como('carla'), 'invitaciones')));
  });

  test('no se pueden modificar ni crear sueltas', async () => {
    await assertFails(
      updateDoc(doc(como('ana'), `invitaciones/${CODIGO}`), { expiraEn: enDias(7) }),
    );
    await assertFails(
      setDoc(doc(como('carla'), `invitaciones/${CODIGO_NUEVO}`), {
        hogarId: 'h1',
        creadoPor: 'carla',
        expiraEn: enDias(7),
      }),
    );
  });
});

describe('unirse con código', () => {
  test('con un código válido, uno se añade a sí mismo', async () => {
    await sembrar();
    await assertSucceeds(unirse(como('carla')));
    await assertSucceeds(getDoc(doc(como('carla'), 'hogares/h1')));
  });

  test('a la vez que actualiza su perfil (como hace la app)', async () => {
    await sembrar();
    const db = como('carla');
    const lote = writeBatch(db);
    lote.update(doc(db, 'hogares/h1'), {
      miembros: arrayUnion('carla'),
      'miembrosInfo.carla': { nombre: 'Carla', codigoUsado: CODIGO },
    });
    lote.update(doc(db, 'users/carla'), { hogarId: 'h1' });
    await assertSucceeds(lote.commit());
  });

  test('sin aportar el código, no', async () => {
    await sembrar();
    await assertFails(
      updateDoc(doc(como('carla'), 'hogares/h1'), {
        miembros: arrayUnion('carla'),
        'miembrosInfo.carla': { nombre: 'Carla' },
      }),
    );
  });

  test('con un código equivocado, no', async () => {
    await sembrar();
    await assertFails(unirse(como('carla'), 'carla', CODIGO_NUEVO));
  });

  test('con un código caducado, no', async () => {
    await sembrar({ expiraEn: enDias(-1) });
    await assertFails(unirse(como('carla')));
  });

  test('con un código regenerado (el anterior), no', async () => {
    await sembrar();
    // ana regenera: crea la invitación nueva y borra la vieja.
    const db = como('ana');
    const lote = writeBatch(db);
    lote.update(doc(db, 'hogares/h1'), { codigoInvitacion: CODIGO_NUEVO });
    lote.set(doc(db, `invitaciones/${CODIGO_NUEVO}`), {
      hogarId: 'h1',
      creadoPor: 'ana',
      expiraEn: enDias(7),
    });
    lote.delete(doc(db, `invitaciones/${CODIGO}`));
    await assertSucceeds(lote.commit());

    await assertFails(unirse(como('carla'), 'carla', CODIGO));
    await assertSucceeds(unirse(como('carla'), 'carla', CODIGO_NUEVO));
  });

  test('un código antiguo no vale aunque su invitación no se haya borrado', async () => {
    await sembrar();
    await entorno.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await updateDoc(doc(db, 'hogares/h1'), { codigoInvitacion: CODIGO_NUEVO });
      await setDoc(doc(db, `invitaciones/${CODIGO_NUEVO}`), {
        hogarId: 'h1',
        creadoPor: 'ana',
        expiraEn: enDias(7),
      });
    });
    await assertFails(unirse(como('carla'), 'carla', CODIGO));
  });

  test('el código de otro hogar no sirve', async () => {
    await sembrar();
    await entorno.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), `invitaciones/${CODIGO_NUEVO}`), {
        hogarId: 'otro',
        creadoPor: 'zoe',
        expiraEn: enDias(7),
      });
      await updateDoc(doc(ctx.firestore(), 'hogares/h1'), { codigoInvitacion: CODIGO_NUEVO });
    });
    await assertFails(unirse(como('carla'), 'carla', CODIGO_NUEVO));
  });

  test('no puede añadir a otra persona', async () => {
    await sembrar();
    await assertFails(unirse(como('carla'), 'dani'));
    await assertFails(
      updateDoc(doc(como('carla'), 'hogares/h1'), {
        miembros: arrayUnion('carla', 'dani'),
        'miembrosInfo.carla': { nombre: 'Carla', codigoUsado: CODIGO },
      }),
    );
  });

  test('no puede tocar ningún otro campo', async () => {
    await sembrar();
    await assertFails(unirse(como('carla'), 'carla', CODIGO, { nombre: 'Mío' }));
    await assertFails(unirse(como('carla'), 'carla', CODIGO, { creadoPor: 'carla' }));
    await assertFails(
      unirse(como('carla'), 'carla', CODIGO, { 'miembrosInfo.ana': { nombre: 'Fea' } }),
    );
  });

  test('no puede quitar a nadie al unirse', async () => {
    await sembrar();
    await assertFails(
      updateDoc(doc(como('carla'), 'hogares/h1'), {
        miembros: ['ana', 'carla'],
        'miembrosInfo.carla': { nombre: 'Carla', codigoUsado: CODIGO },
      }),
    );
  });
});

describe('salir, expulsar, regenerar y borrar', () => {
  beforeEach(() => sembrar());

  test('un miembro puede salir (quitarse a sí mismo)', async () => {
    await assertSucceeds(
      updateDoc(doc(como('blas'), 'hogares/h1'), {
        miembros: arrayRemove('blas'),
        'miembrosInfo.blas': deleteField(),
      }),
    );
    await assertFails(getDoc(doc(como('blas'), 'hogares/h1')));
  });

  test('un miembro no puede quitar a otro', async () => {
    await assertFails(
      updateDoc(doc(como('blas'), 'hogares/h1'), { miembros: arrayRemove('ana') }),
    );
  });

  test('el creador puede expulsar y el expulsado pierde el acceso', async () => {
    await assertSucceeds(
      updateDoc(doc(como('ana'), 'hogares/h1'), { miembros: arrayRemove('blas') }),
    );
    await assertFails(getDoc(doc(como('blas'), 'hogares/h1')));
    await assertFails(getDocs(collection(como('blas'), 'hogares/h1/gastos')));
  });

  test('el creador no puede añadir miembros a dedo', async () => {
    await assertFails(
      updateDoc(doc(como('ana'), 'hogares/h1'), { miembros: arrayUnion('carla') }),
    );
  });

  test('solo el creador regenera el código', async () => {
    const lote = (db, uid) => {
      const b = writeBatch(db);
      b.update(doc(db, 'hogares/h1'), { codigoInvitacion: CODIGO_NUEVO });
      b.set(doc(db, `invitaciones/${CODIGO_NUEVO}`), {
        hogarId: 'h1',
        creadoPor: uid,
        expiraEn: enDias(7),
      });
      b.delete(doc(db, `invitaciones/${CODIGO}`));
      return b.commit();
    };
    await assertFails(lote(como('blas'), 'blas'));
    await assertSucceeds(lote(como('ana'), 'ana'));
  });

  test('regenerar funciona aunque la invitación anterior ya no exista', async () => {
    await entorno.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(doc(ctx.firestore(), `invitaciones/${CODIGO}`));
    });
    const db = como('ana');
    const b = writeBatch(db);
    b.update(doc(db, 'hogares/h1'), { codigoInvitacion: CODIGO_NUEVO });
    b.set(doc(db, `invitaciones/${CODIGO_NUEVO}`), {
      hogarId: 'h1',
      creadoPor: 'ana',
      expiraEn: enDias(7),
    });
    b.delete(doc(db, `invitaciones/${CODIGO}`));
    await assertSucceeds(b.commit());
  });

  test('nadie ajeno puede borrar una invitación', async () => {
    await assertFails(deleteDoc(doc(como('carla'), `invitaciones/${CODIGO}`)));
    await assertFails(deleteDoc(doc(como('blas'), `invitaciones/${CODIGO}`)));
  });

  test('cualquier miembro puede renombrar el hogar', async () => {
    await assertSucceeds(updateDoc(doc(como('blas'), 'hogares/h1'), { nombre: 'Nuestra casa' }));
    await assertFails(updateDoc(doc(como('blas'), 'hogares/h1'), { nombre: '' }));
  });

  test('nadie puede cambiar el creador', async () => {
    await assertFails(updateDoc(doc(como('ana'), 'hogares/h1'), { creadoPor: 'blas' }));
    await assertFails(updateDoc(doc(como('blas'), 'hogares/h1'), { creadoPor: 'blas' }));
  });

  test('solo el creador borra el hogar', async () => {
    await assertFails(deleteDoc(doc(como('blas'), 'hogares/h1')));
    await assertSucceeds(deleteDoc(doc(como('ana'), 'hogares/h1')));
  });
});

describe('gastos', () => {
  beforeEach(() => sembrar());

  test('un miembro apunta un gasto válido', async () => {
    await assertSucceeds(setDoc(doc(como('blas'), 'hogares/h1/gastos/g2'), gastoValido('blas')));
  });

  test('"pagado por" es opcional (null = sin indicar)', async () => {
    await assertSucceeds(
      setDoc(doc(como('blas'), 'hogares/h1/gastos/g2'), gastoValido('blas', { pagadoPor: null })),
    );
    await assertSucceeds(
      setDoc(doc(como('blas'), 'hogares/h1/recurrentes/r1'), {
        importe: 1000,
        categoriaId: 'luz',
        diaDelMes: 5,
        nota: '',
        pagadoPor: null,
        activo: true,
      }),
    );
  });

  test('puede indicar que lo pagó otro miembro, pero no un ajeno', async () => {
    const db = como('blas');
    await assertSucceeds(
      setDoc(doc(db, 'hogares/h1/gastos/g2'), gastoValido('blas', { pagadoPor: 'ana' })),
    );
    await assertFails(
      setDoc(doc(db, 'hogares/h1/gastos/g3'), gastoValido('blas', { pagadoPor: 'carla' })),
    );
  });

  test.each([
    ['importe con decimales', { importe: 12.5 }],
    ['importe cero', { importe: 0 }],
    ['importe negativo', { importe: -100 }],
    ['importe como texto', { importe: '1250' }],
    ['fecha con formato incorrecto', { fecha: '06/11/2026' }],
    ['fecha imposible', { fecha: '2026-13-01' }],
    ['creadoPor de otra persona', { creadoPor: 'ana' }],
    ['editadoPor de otra persona', { editadoPor: 'ana' }],
    ['nota demasiado larga', { nota: 'x'.repeat(201) }],
    ['campo desconocido', { hackeo: true }],
  ])('rechaza %s', async (_, cambio) => {
    await assertFails(
      setDoc(doc(como('blas'), 'hogares/h1/gastos/g2'), gastoValido('blas', cambio)),
    );
  });

  test('otro miembro puede editarlo, pero no cambiar quién lo creó', async () => {
    const db = como('blas');
    await assertSucceeds(
      updateDoc(doc(db, 'hogares/h1/gastos/g1'), {
        importe: 900,
        editadoPor: 'blas',
        editadoEn: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, 'hogares/h1/gastos/g1'), {
        creadoPor: 'blas',
        editadoPor: 'blas',
        editadoEn: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, 'hogares/h1/gastos/g1'), {
        importe: 900,
        editadoPor: 'ana',
        editadoEn: serverTimestamp(),
      }),
    );
  });

  test('cualquier miembro lo puede borrar', async () => {
    await assertSucceeds(deleteDoc(doc(como('blas'), 'hogares/h1/gastos/g1')));
  });

  test('los gastos fijos usan el id {recurrenteId}_{YYYY-MM}', async () => {
    const db = como('blas');
    const fijo = gastoValido('blas', { recurrenteId: 'alquiler', fecha: '2026-11-01' });
    await assertSucceeds(setDoc(doc(db, 'hogares/h1/gastos/alquiler_2026-11'), fijo));
    await assertFails(setDoc(doc(db, 'hogares/h1/gastos/otro-id'), fijo));
  });
});

describe('categorías y recurrentes', () => {
  beforeEach(() => sembrar());

  const categoria = {
    nombre: 'Mascotas',
    icono: '🐶',
    color: '#22c55e',
    presupuestoMensual: 5000,
    archivada: false,
  };

  test('un miembro crea y edita categorías válidas', async () => {
    const db = como('blas');
    await assertSucceeds(setDoc(doc(db, 'hogares/h1/categorias/mascotas'), categoria));
    await assertSucceeds(updateDoc(doc(db, 'hogares/h1/categorias/luz'), { archivada: true }));
    await assertFails(
      setDoc(doc(db, 'hogares/h1/categorias/mal'), { ...categoria, color: 'verde' }),
    );
    await assertFails(
      setDoc(doc(db, 'hogares/h1/categorias/mal'), { ...categoria, presupuestoMensual: 10.5 }),
    );
  });

  test('un miembro puede borrar categorías; un ajeno no', async () => {
    await assertFails(deleteDoc(doc(como('carla'), 'hogares/h1/categorias/luz')));
    await assertSucceeds(deleteDoc(doc(como('blas'), 'hogares/h1/categorias/luz')));
  });

  test('archivar y recuperar una categoría', async () => {
    const ref = doc(como('blas'), 'hogares/h1/categorias/luz');
    await assertSucceeds(updateDoc(ref, { archivada: true }));
    await assertSucceeds(updateDoc(ref, { archivada: false }));
    await assertFails(updateDoc(ref, { archivada: 'si' }));
  });

  test('gastos recurrentes válidos e inválidos', async () => {
    const db = como('blas');
    const fijo = {
      importe: 70000,
      categoriaId: 'hipoteca',
      diaDelMes: 1,
      nota: 'Alquiler',
      pagadoPor: 'ana',
      activo: true,
    };
    await assertSucceeds(setDoc(doc(db, 'hogares/h1/recurrentes/alquiler'), fijo));
    await assertFails(setDoc(doc(db, 'hogares/h1/recurrentes/mal'), { ...fijo, diaDelMes: 31 }));
    await assertFails(setDoc(doc(como('carla'), 'hogares/h1/recurrentes/x'), fijo));
  });
});
