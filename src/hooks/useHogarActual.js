// Hogar del usuario compartido por todas las pestañas (un único listener).
import { createContext, createElement, useContext } from 'react';

const ContextoHogar = createContext(/** @type {import('../data/hogares').Hogar|null} */ (null));

export function ProveedorHogar({ hogar, children }) {
  return createElement(ContextoHogar.Provider, { value: hogar }, children);
}

/** @returns {import('../data/hogares').Hogar} */
export function useHogarActual() {
  return useContext(ContextoHogar);
}
