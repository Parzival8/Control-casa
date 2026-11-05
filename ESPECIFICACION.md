# Especificación: Gastos Casa

## 1. Objetivo
Registrar los gastos del hogar y ver, mes a mes, cuánto se gasta y en qué. Uso personal de dos personas. Prioridad: **apuntar un gasto en menos de 10 segundos** desde el móvil.

## 2. Usuarios
- Jose y su pareja. Sin cuentas ni login en el MVP.
- Cada gasto puede indicar **quién pagó** (campo opcional, lista editable de "personas", por defecto dos).

## 3. Modelo de datos

### Gasto
| Campo | Tipo | Notas |
|---|---|---|
| id | string (uuid) | generado al crear |
| importe | entero | en céntimos, siempre positivo |
| categoriaId | string | referencia a Categoría |
| fecha | string | `YYYY-MM-DD`, por defecto hoy |
| nota | string | opcional |
| pagadoPor | string | opcional |
| recurrenteId | string \| null | si viene de un gasto fijo |
| creadoEn | string | ISO datetime |

### Categoría
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| nombre | string | |
| icono | string | emoji |
| color | string | hex, usado en gráficos |
| presupuestoMensual | entero \| null | céntimos, opcional |
| archivada | boolean | no se borran si tienen gastos |

Categorías iniciales: Hipoteca/Alquiler 🏠, Luz 💡, Agua 🚰, Gas ⛽, Internet y móvil 📶, Comunidad 🏢, Supermercado 🛒, Restaurantes 🍽️, Transporte 🚗, Salud ⚕️, Ocio 🎬, Ropa 👕, Hogar y reformas 🔧, Seguros 🛡️, Otros 📦.

### Gasto recurrente (fase 4)
`id, importe, categoriaId, diaDelMes (1-28), nota, activo, pagadoPor`.
Genera automáticamente un gasto cada mes al abrir la app (sin duplicar si ya existe en ese mes).

## 4. Pantallas

### Inicio (pantalla principal)
- Cabecera con mes actual, flechas para cambiar de mes.
- Total gastado en el mes en grande.
- Barra o resumen por categoría (top categorías).
- Lista de gastos del mes, más recientes primero, con icono de categoría, nota, fecha e importe.
- **Botón flotante (+)** grande, abajo a la derecha, para añadir gasto.

### Añadir / editar gasto (hoja inferior o pantalla completa)
- Importe (teclado numérico, enfocado al abrir).
- Selector de categoría en cuadrícula de iconos.
- Fecha (por defecto hoy).
- Nota opcional y "pagado por" opcional.
- Botón Guardar. En edición, botón Eliminar con confirmación.

### Estadísticas
- Gráfico de tarta/donut: gasto por categoría del mes elegido.
- Gráfico de barras: total de los últimos 12 meses.
- Comparativa con el mes anterior (diferencia en € y %).
- Gasto medio mensual.

### Categorías
- Lista, crear, editar (nombre, icono, color, presupuesto), archivar.

### Ajustes
- Nombres de las personas.
- Gastos recurrentes (fase 4).
- Exportar datos a CSV y copia de seguridad en JSON; importar copia JSON.
- Borrar todos los datos (con doble confirmación).

## 5. Requisitos no funcionales
- **PWA**: instalable, funciona sin conexión, icono y nombre propios.
- **Offline-first**: todo en IndexedDB, sin servidor.
- **Rendimiento**: carga instantánea; miles de gastos sin lag.
- **Accesibilidad básica**: contraste suficiente, botones de al menos 44 px, etiquetas en formularios.
- **Tema**: claro y oscuro según el sistema.
- **Privacidad**: ningún dato sale del dispositivo.

## 6. Fuera del alcance (por ahora)
- Cuentas de usuario, login.
- Sincronización entre dispositivos (posible fase 6 opcional, ver plan).
- Publicación en tiendas.
- Conexión con bancos o lectura de tickets.

## 7. Nota sobre sincronización futura
Con IndexedDB cada móvil tiene sus propios datos. La capa `db/storage.js` debe permitir cambiar la implementación (por ejemplo a Supabase o Firebase) sin tocar las vistas. Por eso es obligatorio no acceder a IndexedDB desde fuera de `src/db/`.
