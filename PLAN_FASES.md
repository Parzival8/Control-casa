# Plan por fases: Gastos Casa

Instrucciones para Claude Code: haz **una fase cada vez**, comprueba los criterios de aceptación, haz commit y espera confirmación del usuario antes de pasar a la siguiente. Lee antes `CLAUDE.md` y `ESPECIFICACION.md`.

---

## Fase 0: Preparación del proyecto
**Tareas**
- Crear proyecto con Vite (JavaScript vanilla) en esta carpeta.
- Instalar `idb`, `chart.js`, `vite-plugin-pwa`.
- Crear la estructura de carpetas descrita en `CLAUDE.md`.
- Configurar `.gitignore`, scripts npm (`dev` con `--host`, `build`, `preview`).
- Pantalla vacía con título "Gastos Casa" y manifest básico.

**Criterios de aceptación**
- `npm run dev` arranca y se ve la página en el móvil por la red local.
- Estructura de carpetas creada y commit inicial hecho.

---

## Fase 1: Núcleo: añadir y ver gastos
**Tareas**
- Implementar `db/storage.js` y `db/indexeddb.js` (gastos y categorías, con las categorías iniciales sembradas en la primera ejecución).
- Utilidades de formato de moneda (€ en es-ES) y fechas.
- Pantalla Inicio: total del mes, lista de gastos del mes, botón flotante (+).
- Formulario de añadir gasto (importe, categoría, fecha, nota).
- Los datos persisten al recargar.

**Criterios de aceptación**
- Puedo añadir un gasto en menos de 10 segundos.
- El total del mes se actualiza al instante y sobrevive a recargar la página.
- Los importes se guardan en céntimos y se muestran como `1.234,56 €`.

---

## Fase 2: Gestión completa
**Tareas**
- Editar y eliminar gastos (con confirmación al eliminar).
- Navegar entre meses con flechas.
- Pantalla de Categorías: crear, editar, archivar.
- Campo "pagado por" y ajuste de nombres de las personas.
- Resumen por categoría en Inicio (barras de progreso).

**Criterios de aceptación**
- Puedo corregir cualquier gasto y cambiar de mes sin errores.
- Una categoría con gastos no se puede borrar, solo archivar.
- El resumen por categoría suma exactamente el total del mes.

---

## Fase 3: Estadísticas
**Tareas**
- Pantalla Estadísticas con Chart.js: donut por categoría del mes y barras de los últimos 12 meses.
- Comparativa con el mes anterior (diferencia en € y %).
- Gasto medio mensual.
- Usar los colores de cada categoría.

**Criterios de aceptación**
- Los gráficos coinciden con los totales de Inicio.
- Se ven bien y legibles en pantalla de 360 px de ancho.
- Con datos vacíos muestran un mensaje amable, no errores.

---

## Fase 4: Automatización y presupuestos
**Tareas**
- Gastos recurrentes (CRUD en Ajustes) que se generan solos cada mes al abrir la app, sin duplicados.
- Presupuesto mensual por categoría con aviso visual al acercarse (>80 %) o superarlo.
- Exportar a CSV (compatible con Excel en español: separador `;`, UTF-8 con BOM).
- Copia de seguridad: exportar e importar JSON completo.

**Criterios de aceptación**
- Abrir la app dos veces en el mismo mes no duplica gastos recurrentes.
- El CSV se abre bien en Excel con tildes y comas decimales.
- Importar un JSON exportado restaura exactamente los mismos datos.

---

## Fase 5: PWA y pulido
**Tareas**
- Manifest completo, iconos (192, 512 y maskable) y nombre corto.
- Service worker con caché para uso offline total.
- Tema claro/oscuro automático.
- Revisión de accesibilidad básica (contraste, tamaños táctiles, etiquetas).
- Estados vacíos, errores y mensajes de confirmación revisados.
- Desplegar gratis (Netlify o Vercel) para tener HTTPS e instalarla en el móvil.

**Criterios de aceptación**
- Se puede instalar en la pantalla de inicio del móvil.
- Funciona con el modo avión activado.
- Lighthouse PWA sin fallos graves.

---

## Fase 6 (opcional): Sincronización entre móviles
Solo si el usuario lo pide. Antes de empezar, **proponer opciones** (Supabase o Firebase), explicar pros y contras y esperar decisión.

**Tareas orientativas**
- Nueva implementación de `db/storage.js` contra el servicio elegido, sin tocar las vistas.
- Acceso compartido para dos personas (un "hogar" común).
- Migración de los datos locales existentes.
- Mantener el modo offline con sincronización al reconectar.

**Criterios de aceptación**
- Un gasto apuntado en un móvil aparece en el otro.
- Los datos locales previos no se pierden.
