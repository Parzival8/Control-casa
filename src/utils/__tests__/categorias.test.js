import { categoriasElegibles, ordenarCategorias } from '../categorias';

const c = (id, nombre, archivada = false) => ({ id, nombre, archivada });

describe('orden de categorías', () => {
  test('las iniciales en su orden y después las propias por nombre', () => {
    const lista = [c('otros', 'Otros'), c('zz', 'Zapatos'), c('hipoteca', 'Hipoteca'), c('aa', 'Mascotas'), c('luz', 'Luz')];
    expect(ordenarCategorias(lista).map((x) => x.id)).toEqual(['hipoteca', 'luz', 'otros', 'aa', 'zz']);
  });

  test('las archivadas no se ofrecen, salvo la que ya tiene el gasto', () => {
    const lista = [c('luz', 'Luz'), c('gas', 'Gas', true)];
    expect(categoriasElegibles(lista).map((x) => x.id)).toEqual(['luz']);
    expect(categoriasElegibles(lista, 'gas').map((x) => x.id)).toEqual(['luz', 'gas']);
  });
});
