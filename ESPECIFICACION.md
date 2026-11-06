# Especificación: Control Casa

## 1. Objetivo
App móvil para registrar los gastos del hogar y ver, mes a mes, cuánto se gasta y en qué, **compartiendo los datos con las personas con las que se vive**. Prioridad: **apuntar un gasto en menos de 10 segundos**. Se publicará en Google Play.

## 2. Conceptos clave
- **Usuario**: persona con cuenta (email y contraseña).
- **Hogar**: grupo de usuarios que comparten gastos (pareja, piso compartido, familia). Todos los miembros tienen los mismos permisos: **ven y editan todos los gastos del hogar**.
- **Creador del hogar**: miembro que lo creó. Es el único con permisos extra: expulsar miembros, regenerar el código de invitación y borrar el hogar.
- En la primera versión **un usuario pertenece a un solo hogar** (ver "Fuera del alcance").

## 3. Flujo de cuentas y hogar
1. Registro con nombre, email y contraseña (recuperación de contraseña por email).
2. Tras iniciar sesión, si no pertenece a ningún hogar: **Crear hogar** (nombre) o **Unirse con código**.
3. Al crear un hogar se genera un **código de invitación** de 6-8 caracteres (sin caracteres ambiguos como 0/O, 1/I). Se comparte desde la app con el menú de compartir del móvil (WhatsApp, etc.).
4. La otra persona se registra, elige "Unirse con código", lo introduce y entra al hogar con todos los gastos ya existentes.
5. Cualquier miembro puede **salir** del hogar. El creador puede **expulsar** miembros y **regenerar el código** (el anterior deja de valer). Los gastos de quien sale o es expulsado **se conservan** en el hogar.
6. El código de invitación caduca a los 7 días o al regenerarlo.

## 4. Modelo de datos (Firestore)

```
users/{uid}
  nombre, email, hogarId (o null), creadoEn

hogares/{hogarId}
  nombre, creadoPor (uid), miembros: [uid, ...], creadoEn
  codigoInvitacion                           # código vigente; al regenerarlo el anterior deja de valer
  miembrosInfo: { uid: { nombre, codigoUsado? } }  # nombres sin leer users/; codigoUsado = código con el que se unió
  /gastos/{gastoId}
  /categorias/{categoriaId}
  /recurrentes/{recurrenteId}

invitaciones/{codigo}
  hogarId, creadoPor, expiraEn
```

### Gasto
| Campo | Tipo | Notas |
|---|---|---|
| importe | entero | en céntimos, siempre positivo |
| categoriaId | string | |
| fecha | string | `YYYY-MM-DD` |
| nota | string | opcional |
| pagadoPor | string (uid) \| null | **opcional**: miembro que pagó; `null` = sin indicar (valor por defecto) |
| creadoPor | string (uid) | quién lo apuntó |
| editadoPor | string (uid) | último que lo modificó |
| recurrenteId | string \| null | si lo generó un gasto fijo |
| creadoEn / editadoEn | timestamp | |

### Categoría
`nombre, icono (emoji), color (hex), presupuestoMensual (céntimos o null), archivada`.
Se crean las categorías iniciales al crear el hogar: Hipoteca/Alquiler 🏠, Luz 💡, Agua 🚰, Gas ⛽, Internet y móvil 📶, Comunidad 🏢, Supermercado 🛒, Restaurantes 🍽️, Transporte 🚗, Salud ⚕️, Ocio 🎬, Ropa 👕, Hogar y reformas 🔧, Seguros 🛡️, Otros 📦. Las categorías son **compartidas por el hogar**.

### Gasto recurrente
`importe, categoriaId, diaDelMes (1-28), nota, pagadoPor (opcional, uid o null), activo`.
Se generan al abrir la app. **Id determinista** del gasto generado: `{recurrenteId}_{YYYY-MM}`, de modo que si dos miembros abren la app a la vez no se duplica.

## 5. Seguridad (reglas de Firestore)
Requisitos obligatorios; deben tener tests con el emulador:
- Sin sesión iniciada no se lee ni escribe nada.
- Un usuario solo lee y escribe en `hogares/{id}` y sus subcolecciones si su uid está en `miembros`.
- Solo cada usuario puede leer y escribir su propio `users/{uid}`.
- Validar campos al escribir: `importe` entero > 0, `fecha` con formato válido, tipos correctos, `creadoPor` igual al uid autenticado.
- **Unirse a un hogar**: un usuario no miembro puede añadirse a `miembros` **solo** si existe una invitación válida (no caducada) para ese hogar, cuyo código aporta en la propia escritura, y **solo puede añadir su propio uid**. No puede tocar ningún otro campo.
- Solo el creador puede quitar a otros miembros, regenerar el código o borrar el hogar. Un miembro sí puede quitarse a sí mismo.
- Las invitaciones se pueden **leer por código exacto** (get) pero **no listar**.
- Si implementar el "unirse" solo con reglas resulta frágil, la alternativa es una Cloud Function, que exige plan Blaze (de pago con tarjeta, aunque con cuota gratuita). **Preguntar al usuario antes de optar por ella.**

## 6. Pantallas

### Acceso
Login, registro, recuperar contraseña.

### Sin hogar
Dos opciones grandes: "Crear hogar" y "Unirme con código".

### Inicio (pestaña principal)
- Cabecera con el nombre del hogar, mes con flechas para cambiar de mes y **total del mes** en grande.
- Resumen por categoría (barras).
- Lista de gastos del mes, más recientes primero: icono de categoría, nota, fecha, importe y quién lo pagó (avatar con inicial). **Se actualiza en tiempo real** cuando otro miembro añade o edita.
- Botón flotante (+) para añadir gasto. Toque en un gasto para editarlo o eliminarlo (con confirmación).
- Filtros: por categoría y por quién pagó.

### Añadir / editar gasto
Importe (teclado numérico, enfocado al abrir), categoría en cuadrícula de iconos, fecha (hoy por defecto), nota opcional, "pagado por" opcional (miembros del hogar o "Sin indicar", que es lo predeterminado). En edición: botón eliminar.

### Estadísticas
- Donut: gasto por categoría del mes.
- Barras: total de los últimos 12 meses.
- Comparativa con el mes anterior (€ y %), gasto medio mensual.
- **Reparto entre miembros**: cuánto ha pagado cada uno en el mes y cuánto le tocaría a cada uno si se divide a partes iguales (resumen informativo de "quién debe a quién"; no gestiona pagos).

### Categorías
Lista; crear, editar (nombre, icono, color, presupuesto), archivar. Una categoría con gastos no se borra, se archiva.

### Ajustes
- Perfil (nombre), cerrar sesión.
- Hogar: nombre, miembros, código de invitación (compartir, regenerar), salir del hogar, expulsar miembros y borrar hogar (solo creador).
- Gastos recurrentes.
- Exportar a CSV (separador `;`, UTF-8 con BOM, compatible con Excel en español).
- **Eliminar mi cuenta** (obligatorio para publicar en Google Play): borra el usuario y sus datos personales; los gastos que apuntó se conservan en el hogar sin su nombre.
- Enlaces a política de privacidad y términos.

## 7. Requisitos no funcionales
- **Offline**: se puede consultar y apuntar gastos sin conexión; se sincroniza al volver la red (persistencia offline de Firestore).
- **Tiempo real**: los cambios de otros miembros aparecen sin recargar.
- **Rendimiento**: arranque rápido y listas fluidas con miles de gastos (consultas por mes, nunca cargar todo).
- **Accesibilidad básica**: contraste suficiente, zonas táctiles de al menos 48 px, etiquetas para lectores de pantalla.
- **Tema** claro/oscuro automático.
- **Privacidad**: solo los miembros de un hogar acceden a sus datos; mínimo de datos personales (nombre y email).
- **Costes**: debe funcionar dentro del plan gratuito de Firebase (Spark) para un uso normal.

## 8. Publicación (Google Play)
Requiere: política de privacidad accesible por URL, formulario de seguridad de datos (Data safety), clasificación de contenido, eliminación de cuenta dentro de la app y desde una URL web, icono y capturas, y la firma de la app por Play App Signing. Detalle en la fase 7 del plan.

## 9. Fuera del alcance (por ahora)
- Varios hogares por usuario (se podrá ampliar: el modelo ya cuelga todo de `hogares/{id}`).
- Inicio de sesión con Google o Apple.
- Notificaciones push.
- iOS.
- Gastos en otras monedas, adjuntar fotos de tickets, conexión con bancos.
- Reparto desigual de gastos y registro de pagos entre miembros.
