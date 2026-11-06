// Estado de la sesión compartido por toda la app: usuario, perfil y si está cargando.
import { createContext, createElement, useContext, useEffect, useState } from 'react';

import { escucharSesion } from '../data/auth';
import { escucharPerfil } from '../data/usuarios';

/**
 * @typedef {Object} EstadoSesion
 * @property {import('../data/auth').UsuarioSesion|null} usuario
 * @property {import('../data/usuarios').Perfil|null} perfil
 * @property {boolean} cargando   true mientras no se sabe si hay sesión o perfil.
 */

const ContextoSesion = createContext(
  /** @type {EstadoSesion} */ ({ usuario: null, perfil: null, cargando: true }),
);

/** Envuelve la app y escucha la sesión y el perfil en tiempo real. */
export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [sesionLista, setSesionLista] = useState(false);
  // Perfil junto con el uid al que pertenece, para no mezclar usuarios.
  const [perfilDe, setPerfilDe] = useState({ uid: null, perfil: null });

  useEffect(
    () =>
      escucharSesion((nuevo) => {
        setUsuario(nuevo);
        setSesionLista(true);
      }),
    [],
  );

  const uid = usuario?.uid ?? null;
  useEffect(() => {
    if (!uid) return undefined;
    return escucharPerfil(
      uid,
      (perfil) => setPerfilDe({ uid, perfil }),
      // Si falla (p. ej. sin conexión la primera vez), seguimos sin perfil.
      () => setPerfilDe({ uid, perfil: null }),
    );
  }, [uid]);

  const perfilListo = !uid || perfilDe.uid === uid;
  const valor = {
    usuario,
    perfil: uid && perfilDe.uid === uid ? perfilDe.perfil : null,
    cargando: !sesionLista || !perfilListo,
  };
  return createElement(ContextoSesion.Provider, { value: valor }, children);
}

/** @returns {EstadoSesion} */
export function useSesion() {
  return useContext(ContextoSesion);
}
