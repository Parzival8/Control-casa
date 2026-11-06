import { listaMiembros, textoInvitacion } from '../textoInvitacion';

describe('texto de invitación', () => {
  test('incluye hogar, código y caducidad en dd/mm/aaaa', () => {
    const texto = textoInvitacion({
      nombreHogar: 'Casa',
      codigo: 'K7MP2XQA',
      expiraEn: new Date(2026, 10, 13),
    });
    expect(texto).toContain('«Casa»');
    expect(texto).toContain('K7MP2XQA');
    expect(texto).toContain('13/11/2026');
  });

  test('sin caducidad conocida no la menciona', () => {
    expect(textoInvitacion({ nombreHogar: 'Casa', codigo: 'X', expiraEn: null })).not.toMatch(
      /Vale hasta/,
    );
  });
});

describe('lista de miembros', () => {
  test('marca quién eres tú y quién creó el hogar', () => {
    const hogar = {
      creadoPor: 'ana',
      miembros: ['ana', 'blas'],
      miembrosInfo: { ana: { nombre: 'Ana' }, blas: { nombre: 'Blas' } },
    };
    expect(listaMiembros(hogar, 'blas')).toEqual([
      { uid: 'ana', nombre: 'Ana', esTu: false, esCreador: true },
      { uid: 'blas', nombre: 'Blas', esTu: true, esCreador: false },
    ]);
  });
});
