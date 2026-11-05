# Gastos Casa

App personal para controlar los gastos mensuales del hogar (uso de una pareja, no se publicará por ahora).

## Documentos del proyecto (léelos antes de tocar código)
- `ESPECIFICACION.md`: qué debe hacer la app (funciones, datos, pantallas).
- `PLAN_FASES.md`: orden de trabajo por fases con criterios de aceptación.

## Stack
- PWA instalable en el móvil: **Vite + JavaScript vanilla (ES modules)**. Sin frameworks (el usuario está aprendiendo JS y quiere poder leer y entender el código).
- Almacenamiento local: **IndexedDB** mediante la librería `idb`.
- Service worker y manifest: `vite-plugin-pwa`.
- Gráficos: `Chart.js`.
- Sin backend en el MVP. La capa de datos debe estar aislada (ver Arquitectura) para poder añadir sincronización más adelante.

## Arquitectura
```
src/
  main.js            # arranque y router sencillo
  db/                # TODA la lectura/escritura de datos pasa por aquí
    storage.js       # interfaz: getGastos, addGasto, updateGasto, deleteGasto, etc.
    indexeddb.js     # implementación con idb
  views/             # una pantalla por archivo (inicio, mes, categorias, ajustes)
  components/        # piezas reutilizables (lista de gastos, formulario, gráfico)
  utils/             # formato de moneda/fechas, cálculos de totales
  styles/
```
Regla clave: ninguna vista accede a IndexedDB directamente; siempre mediante `db/storage.js`.

## Convenciones
- Idioma: **todo en español de España** (interfaz, comentarios, nombres de variables de dominio como `gasto`, `categoria`, `importe`).
- Moneda: euros, formato `1.234,56 €` (usar `Intl.NumberFormat('es-ES')`).
- Fechas: guardar en ISO (`YYYY-MM-DD`), mostrar en formato `dd/mm/aaaa`.
- Importes: guardar como **céntimos en entero** para evitar errores de decimales.
- Diseño **mobile-first**, botones grandes, un solo pulgar. Probar a 360 px de ancho.
- Código sencillo y comentado donde la lógica no sea obvia. Preferir claridad a ingenio.
- Funciones pequeñas, un archivo por responsabilidad.

## Comandos
- `npm run dev`: servidor de desarrollo (`--host` para probar desde el móvil en la misma wifi).
- `npm run build`: build de producción.
- `npm run preview`: previsualizar el build (necesario para probar la PWA/offline).

## Flujo de trabajo
- Trabajar **una fase cada vez**, siguiendo `PLAN_FASES.md`.
- Al terminar cada fase: comprobar los criterios de aceptación, explicar brevemente qué se ha hecho y cómo probarlo, y hacer commit con mensaje claro en español.
- No empezar la fase siguiente sin que el usuario lo confirme.
- Si hay una decisión de diseño con varias opciones razonables, preguntar antes de elegir.
- No añadir dependencias nuevas sin avisar y justificarlas.
- Mantener este archivo actualizado si cambian decisiones importantes.
