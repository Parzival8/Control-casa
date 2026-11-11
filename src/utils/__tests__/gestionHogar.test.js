import { anadirHogarAnterior, consecuenciaDeIrse, sucesorPropuesto } from '../gestionHogar';

describe('gestión del hogar', () => {
  const hogar = { creadoPor: 'ana', miembros: ['ana', 'blas', 'carla'] };

  test('se propone al miembro más antiguo de los que quedan', () => {
    expect(sucesorPropuesto(hogar, 'ana')).toBe('blas');
    expect(sucesorPropuesto({ miembros: ['ana'] }, 'ana')).toBeNull();
  });

  test('consecuencia de irse', () => {
    expect(consecuenciaDeIrse(hogar, 'blas')).toBe('salir');
    expect(consecuenciaDeIrse(hogar, 'ana')).toBe('traspasar');
    expect(consecuenciaDeIrse({ creadoPor: 'ana', miembros: ['ana'] }, 'ana')).toBe('borrar');
  });

  test('hogares anteriores sin repetir y con máximo', () => {
    expect(anadirHogarAnterior(undefined, 'h1')).toEqual(['h1']);
    expect(anadirHogarAnterior(['h1', 'h2'], 'h1')).toEqual(['h2', 'h1']);
    const muchos = Array.from({ length: 60 }, (_, i) => `h${i}`);
    expect(anadirHogarAnterior(muchos, 'nuevo')).toHaveLength(50);
  });
});
