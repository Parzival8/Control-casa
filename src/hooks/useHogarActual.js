// Hogar y categorías del usuario, compartidos por todas las pantallas de la app
// (se escuchan una sola vez en app/(app)/_layout.js).
import { createContext, createElement, useContext } from 'react';

/**
 * @typedef {Object} DatosHogar
 * @property {import('../data/hogares').Hogar} hogar
 * @property {import('../utils/categoriasIniciales').Categoria[]} categorias
 */

const ContextoHogar = createContext(/** @type {DatosHogar} */ ({ hogar: null, categorias: [] }));

export function ProveedorHogar({ hogar, categorias, children }) {
  return createElement(ContextoHogar.Provider, { value: { hogar, categorias } }, children);
}

/** @returns {import('../data/hogares').Hogar} */
export function useHogarActual() {
  return useContext(ContextoHogar).hogar;
}

/** Categorías del hogar (incluidas las archivadas). */
export function useCategorias() {
  return useContext(ContextoHogar).categorias;
}
