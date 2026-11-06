# Control Casa

App **móvil nativa** para llevar los gastos mensuales del hogar de forma **compartida**: varias personas (pareja, compañeros de piso, familia) forman un "hogar" y todos ven y editan los mismos gastos en tiempo real. Se **publicará en Google Play**.

## Documentos del proyecto (léelos antes de tocar código)
- `ESPECIFICACION.md`: qué debe hacer la app (funciones, modelo de datos, pantallas, seguridad).
- `PLAN_FASES.md`: orden de trabajo por fases con criterios de aceptación.

## Estado del repositorio
El prototipo anterior en formato PWA (Vite) se eliminó en la Fase 0; sigue en el commit `baedfb1` del historial (`git show baedfb1:ruta/archivo`). De él se reutilizaron `src/utils/formato.js` y `src/utils/categoriasIniciales.js`.

## Configuración del proyecto (Fase 0)
- Expo SDK 58, React Native 0.88, Expo Router, `@react-native-firebase` 27 (app, auth, firestore).
- Paquete Android: **`com.parzival8.controlcasa`** (no se puede cambiar tras publicar).
- Expo: cuenta `parzival8`, proyecto `control-casa`, id `a8fe5364-9e2b-4434-86f9-c2f05bd2f145`.
- Firebase: proyecto `control-casa-7df4f`, Firestore en `eur3`, Authentication con email/contraseña.
- La configuración está en `app.config.js` (no `app.json`) para leer `google-services.json` desde la variable de EAS `GOOGLE_SERVICES_JSON` (tipo archivo, visibilidad *Secret*, en los tres entornos).
- **Builds de prueba (APK)**: los compila **GitHub Actions** (`.github/workflows/apk-android.yml`) con cada push o con "Run workflow", y los publica en **Releases** para descargarlos desde el móvil. Necesita el secreto de Actions `GOOGLE_SERVICES_JSON` (contenido completo del archivo). El APK va firmado con la clave de depuración de Expo: vale para probar, no para Play. El usuario no usa ordenador.
- EAS (`eas.json`, botón "Build from GitHub" en expo.dev) queda como alternativa y para el AAB de producción en la Fase 7.
- **Unirse a un hogar sin Cloud Functions**: el código va en la propia escritura (`miembrosInfo.{uid}.codigoUsado`) y las reglas comprueban que es el vigente del hogar (`hogares/{id}.codigoInvitacion`), que la invitación existe, es de ese hogar y no ha caducado. Códigos de 8 caracteres sin 0/O/1/I.
- Navegación: `app/index.js` redirige según sesión/hogar y `Stack.Protected` en `app/_layout.js` impide abrir pantallas de otro grupo. La pestaña de inicio es `/inicio`.
- **"Pagado por" es opcional** (decisión del usuario, Fase 2): `pagadoPor` es un uid o `null` ("Sin indicar", lo predeterminado). En la Fase 4 hay que decidir con el usuario cómo cuentan en el reparto los gastos sin indicar.
- Gastos sin conexión: crear/editar/borrar **no esperan** al servidor (Firestore los guarda en el móvil y los sincroniza); los errores del servidor se avisan con un `Alert`. La persistencia offline de Firestore viene activada por defecto en Android.
- Las escrituras que cambian `users/{uid}.hogarId` se hacen después de que el servidor confirme el hogar (si no, la app escucharía el hogar antes de tener permiso).
- Fecha del gasto: selector nativo `@react-native-community/datetimepicker` (botones Hoy/Ayer/Otro día).
- Formato de moneda: `formatearImporte` lo hace a mano en vez de con `Intl.NumberFormat`, porque Hermes (el motor JS del móvil) no garantiza `useGrouping: 'always'` y en es-ES 4 cifras saldrían sin punto.

## Stack
- **Expo (React Native) con JavaScript** y **Expo Router** para navegar. Sin TypeScript (el usuario está aprendiendo JS y quiere poder leer el código); documentar los modelos con JSDoc.
- **Firebase** con `@react-native-firebase`: Authentication (email y contraseña), Firestore (con persistencia offline y escucha en tiempo real) y reglas de seguridad.
- Al usar módulos nativos, **no funciona Expo Go**: se prueba con *development builds* de **EAS Build** (en la nube, no hace falta Android Studio instalado).
- Gráficos: librería sencilla compatible con Expo (proponer y justificar la elegida, p. ej. `react-native-gifted-charts`).
- Tests de lógica pura (totales, formato, dinero) con Jest. Reglas de Firestore probadas con el emulador de Firebase.
- Plataforma objetivo inicial: **Android**. iOS queda como opcional en el futuro.

## Arquitectura
```
app/                     # pantallas (Expo Router)
  index.js               # entrada: redirige según sesión y hogar
  (auth)/                # login, registro, recuperar contraseña
  (hogar)/               # crear hogar o unirse con código
  (app)/                 # con hogar: escucha hogar y categorías (contexto)
    (tabs)/              # inicio, estadísticas, categorías, ajustes
    gasto/               # nuevo.js, [id].js (editar/eliminar)
src/
  data/                  # TODO el acceso a Firebase vive aquí
    auth.js  hogares.js  gastos.js  categorias.js  recurrentes.js
  components/            # piezas reutilizables
  hooks/                 # useHogar, useGastosDelMes, etc.
  utils/                 # formato de moneda y fechas, cálculos (puros y testeados)
firestore.rules          # reglas de seguridad (versionadas y con tests)
```
Regla clave: **ninguna pantalla ni componente importa Firebase directamente**; siempre pasan por `src/data/`. Así el código de interfaz queda simple y la lógica de datos se puede probar y cambiar.

## Convenciones
- Idioma: **todo en español de España** (interfaz, comentarios, nombres de dominio como `gasto`, `categoria`, `importe`, `hogar`).
- Moneda en euros, formato `1.234,56 €`, siempre con `formatearImporte` de `src/utils/formato.js`.
- Fechas: guardar `YYYY-MM-DD`; mostrar `dd/mm/aaaa`.
- Importes: **céntimos en entero**, siempre.
- Diseño mobile-first, botones grandes, uso con una mano, tema claro/oscuro según el sistema.
- Código sencillo y comentado donde la lógica no sea obvia. Funciones pequeñas, un archivo por responsabilidad.
- Todo texto visible al usuario en español; ningún texto suelto en inglés.

## Seguridad y secretos (IMPORTANTE: el repositorio es público)
- **No subir nunca** claves privadas, cuentas de servicio, `.env` con secretos ni keystores de firma. Añadirlos a `.gitignore`.
- `google-services.json` no se commitea: se pasa a EAS como *file secret*. Dejar un `google-services.example.json` vacío de ejemplo.
- La protección real de los datos son las **reglas de Firestore** (`firestore.rules`). Un usuario solo puede leer y escribir datos de hogares de los que es miembro. Cualquier cambio en el modelo de datos exige revisar las reglas y sus tests.

## Qué puede y qué no puede verificar Claude Code
- Puede: escribir código, ejecutar tests de lógica, lint, probar reglas con el emulador, `npx expo-doctor`, y preparar builds.
- **No puede** ver la app en un móvil ni usar la consola de Firebase/Play. Al terminar cada fase debe decir claramente qué queda por probar a mano y dar los pasos exactos (qué build instalar y qué comprobar).
- Los pasos que solo puede hacer el usuario (crear proyecto de Firebase, cuenta de Expo, subir a Play Console) están en `PLAN_FASES.md`, fase 0 y fase 7. Guiarle paso a paso cuando toque.

## Comandos
- `npm start` (`expo start --dev-client`): servidor de desarrollo para el build de desarrollo instalado en el móvil.
- APK de prueba: GitHub → pestaña **Actions** → "APK Android" → **Run workflow** (o cualquier push). El APK aparece en **Releases**.
- Alternativa con EAS: en expo.dev → **Build from GitHub**, perfil `preview` (equivale a `eas build --profile preview --platform android`).
- Perfiles de `eas.json`: `development` (APK con dev client), `preview` (APK normal para probar), `production` (AAB para Google Play).
- `npm test`: tests de lógica (`src/utils/__tests__`) y de navegación (`tests/navegacion`, con `expo-router/testing-library` y la capa `src/data` simulada).
- `npm run lint`: ESLint con la configuración de Expo.
- `npm run doctor`: `expo-doctor`. Desde Claude Code hay que usar `EXPO_OFFLINE=1` porque la red de la sesión bloquea `exp.host`/`api.expo.dev`; por la misma razón, instalar paquetes con `EXPO_OFFLINE=1 npx expo install <paquete>`.
- `npm run test:rules`: tests de reglas (`tests/reglas`) contra el emulador de Firestore (necesita Java). Proyecto `demo-control-casa`, nunca toca el real.
- Publicar reglas (lo hace el usuario desde su ordenador, en la carpeta del repositorio): `firebase deploy --only firestore:rules` (`.firebaserc` ya apunta a `control-casa-7df4f`).
- GitHub Actions: `pruebas.yml` (lint + todos los tests, en cada push) y `apk-android.yml` (APK).

## Flujo de trabajo
- Trabajar **una fase cada vez**, siguiendo `PLAN_FASES.md`.
- Al terminar cada fase: comprobar criterios de aceptación, explicar qué se ha hecho y cómo probarlo, y hacer commit en español.
- No empezar la fase siguiente sin confirmación del usuario.
- Si hay una decisión de diseño con varias opciones razonables, o algo que cueste dinero, preguntar antes.
- No añadir dependencias nuevas sin avisar y justificarlas.
- Mantener este archivo al día si cambian decisiones importantes.
