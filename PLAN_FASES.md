# Plan por fases: Control Casa

Instrucciones para Claude Code: haz **una fase cada vez**, comprueba los criterios de aceptación, haz commit y espera confirmación del usuario antes de pasar a la siguiente. Lee antes `CLAUDE.md` y `ESPECIFICACION.md`.

Las tareas marcadas con 👤 solo puede hacerlas el usuario (Claude Code no tiene acceso a consolas web ni al móvil): explícale los pasos uno a uno, con capturas descritas y sin dar nada por sabido.

---

## Fase 0: Preparación y cambio a app móvil

**👤 Requisitos previos del usuario**
1. Crear cuenta gratuita en **expo.dev** y verificar el email.
2. Crear proyecto en la **consola de Firebase** (plan Spark, gratuito). Nombre sugerido: `control-casa`. Desactivar Google Analytics si pregunta (no hace falta).
3. En Firebase, activar **Authentication → método email/contraseña** y crear la base de datos **Firestore** (modo producción, región europea, por ejemplo `eur3`).
4. En Firebase, añadir una **app Android** con el nombre de paquete acordado con Claude Code (formato `com.nombre.controlcasa`; **no se puede cambiar después de publicar**) y descargar `google-services.json`.
5. Instalar Node.js LTS en su ordenador personal y hacer `npm install -g eas-cli` y `eas login`.

**Tareas de Claude Code**
- Pactar con el usuario el **nombre de paquete** Android antes de empezar.
- Recordar que el prototipo queda en el commit `baedfb1`; **eliminar de `main` el código Vite/PWA** (carpeta `src`, `vite.config.js`, `index.html`, etc.) y crear el proyecto Expo con Expo Router en esta carpeta, en JavaScript.
- Reutilizar `formato.js` y `categoriasIniciales.js` del prototipo (revisar que `useGrouping: 'always'` esté en el formateador de moneda).
- Instalar y configurar `@react-native-firebase/app`, `auth` y `firestore` con sus config plugins de Expo.
- Crear `eas.json` con perfiles `development`, `preview` y `production`; `app.json` con el paquete Android.
- Estructura de carpetas de `CLAUDE.md`, ESLint, Jest, `.gitignore` (incluye `google-services.json`, `.env`, keystores) y `google-services.json.example`.
- Configurar `google-services.json` como *file secret* de EAS (guiar al usuario).
- Pantalla vacía "Control Casa" para validar el build.
- Rellenar la sección "Comandos" de `CLAUDE.md`.

**Criterios de aceptación**
- `eas build --profile development --platform android` termina bien y el usuario instala el APK en su móvil.
- La app abre y muestra la pantalla vacía, conectada a Firebase sin errores.
- Ningún secreto en el repositorio (comprobarlo antes del commit).

---

## Fase 1: Cuentas y hogar compartido
**Tareas**
- Registro, login, cierre de sesión y recuperación de contraseña (`src/data/auth.js`), con la sesión persistente.
- Documento `users/{uid}` al registrarse.
- Pantalla "Sin hogar": crear hogar (genera código de invitación, crea categorías iniciales) y unirse con código.
- Compartir el código con el menú nativo de compartir.
- **`firestore.rules`** completas según la sección 5 de la especificación y sus **tests con el emulador** (`npm run test:rules`).
- Desplegar las reglas (👤 `firebase deploy --only firestore:rules` con guía de Claude Code).

**Criterios de aceptación**
- Dos cuentas distintas (en dos móviles, o móvil + emulador) pueden crear un hogar y unirse con el código.
- Un usuario ajeno **no puede** leer ni escribir datos de un hogar al que no pertenece (probado en tests de reglas).
- Un código caducado o regenerado no permite unirse (probado).
- Los errores se muestran en español y con mensajes claros (contraseña incorrecta, código inválido…).

---

## Fase 2: Gastos compartidos en tiempo real
**Tareas**
- `src/data/gastos.js`: alta, edición, borrado y escucha en tiempo real de los gastos de un mes.
- Pantalla Inicio: total del mes, lista, navegación entre meses, botón (+).
- Formulario de añadir/editar gasto con "pagado por" (miembros del hogar) y `creadoPor`/`editadoPor` automáticos.
- Eliminar con confirmación.
- Persistencia offline activada y comprobada.
- Tests de Jest para los cálculos (totales, céntimos, formato).

**Criterios de aceptación**
- Un gasto apuntado en un móvil aparece en el otro **en pocos segundos sin recargar**.
- Los dos pueden editarlo y borrarlo.
- Sin conexión se puede apuntar un gasto y se sincroniza al volver la red.
- Importes en céntimos y mostrados como `1.234,56 €`.

---

## Fase 3: Categorías y resumen
**Tareas**
- Pantalla Categorías compartida: crear, editar, archivar.
- Una categoría con gastos no se puede borrar, solo archivar.
- Resumen por categoría en Inicio, con barras de progreso.
- Filtros por categoría y por quién pagó.

**Criterios de aceptación**
- Un cambio de categoría hecho por un miembro lo ve el otro en tiempo real.
- El resumen por categoría suma exactamente el total del mes.

---

## Fase 4: Estadísticas y reparto
**Tareas**
- Pestaña Estadísticas: donut por categoría, barras de los últimos 12 meses, comparativa con el mes anterior y gasto medio mensual.
- **Reparto entre miembros**: pagado por cada uno en el mes, parte que le correspondería a partes iguales y diferencia (quién debe a quién). Con tests de Jest, incluyendo redondeos de céntimos (el reparto debe cuadrar al céntimo).
- Estados vacíos amables.

**Criterios de aceptación**
- Los gráficos coinciden con los totales de Inicio.
- Con 2, 3 y 4 miembros el reparto suma exactamente cero.
- Se ve bien en pantallas pequeñas (360 px de ancho).

---

## Fase 5: Gastos fijos, presupuestos y exportación
**Tareas**
- Gastos recurrentes (CRUD en Ajustes) que se generan al abrir la app con **id determinista** `{recurrenteId}_{YYYY-MM}` para evitar duplicados.
- Presupuesto mensual por categoría con aviso visual al pasar del 80 % y al superarlo.
- Exportar el mes o todo el hogar a CSV y compartirlo (separador `;`, UTF-8 con BOM).

**Criterios de aceptación**
- Si dos miembros abren la app a la vez el mismo mes, **no se duplican** los gastos fijos.
- El CSV se abre bien en Excel con tildes y decimales con coma.

---

## Fase 6: Gestión del hogar y de la cuenta
**Tareas**
- Pantalla Ajustes → Hogar: nombre, lista de miembros, código de invitación (compartir y regenerar).
- Salir del hogar; el creador puede expulsar miembros y borrar el hogar (con doble confirmación).
- **Eliminar mi cuenta**: borra usuario y datos personales; los gastos se conservan sin el nombre. Debe funcionar también si el usuario es el creador (decidir con el usuario qué pasa con el hogar: traspasar la propiedad a otro miembro o borrarlo si es el único).
- Actualizar y probar las reglas para todos estos casos.

**Criterios de aceptación**
- Un miembro expulsado pierde el acceso inmediatamente.
- Eliminar cuenta funciona de principio a fin y no deja datos personales.
- Tests de reglas actualizados y en verde.

---

## Fase 7: Pulido y publicación en Google Play
**Tareas de Claude Code**
- Icono adaptativo, pantalla de carga (splash), nombre y versión.
- Revisión de accesibilidad, estados de carga y errores, textos en español.
- Redactar **política de privacidad** y **términos** en español (claros, sin inventar prácticas que la app no hace) y una página web simple con la URL para eliminar cuenta, lista para publicar (p. ej. GitHub Pages).
- Preparar el build de producción (`.aab`) con EAS y la firma gestionada por Play App Signing.
- Preparar los textos de la ficha: título, descripción corta y larga, capturas recomendadas y guía para el formulario de **seguridad de datos**.

**👤 Tareas del usuario (con guía de Claude Code)**
1. Crear la ficha de la app en Google Play Console con el mismo nombre de paquete.
2. Rellenar clasificación de contenido, seguridad de datos, política de privacidad y declaraciones de la consola.
3. Subir el `.aab` a **pruebas internas** y probar con al menos dos personas reales.
4. Comprobar en la consola si, por el tipo y antigüedad de la cuenta de desarrollador, se exige una **prueba cerrada con un mínimo de testers durante un número de días** antes de poder publicar en producción, y cumplirla si procede.
5. Enviar a producción.

**Criterios de aceptación**
- Una instalación desde pruebas internas de Play funciona completa con dos cuentas reales.
- La ficha pasa la revisión de la consola sin avisos pendientes.

---

## Fase 8 (opcional, solo si el usuario lo pide)
- Inicio de sesión con Google.
- Notificaciones push ("Ana ha añadido un gasto"). Probablemente exija Cloud Functions y plan Blaze: consultar antes.
- Varios hogares por usuario.
- Versión para iOS (requiere cuenta de Apple Developer de pago).
- Reparto desigual entre miembros y registro de pagos.
