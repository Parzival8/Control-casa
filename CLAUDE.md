# Control Casa

App **móvil nativa** para llevar los gastos mensuales del hogar de forma **compartida**: varias personas (pareja, compañeros de piso, familia) forman un "hogar" y todos ven y editan los mismos gastos en tiempo real. Se **publicará en Google Play**.

## Documentos del proyecto (léelos antes de tocar código)
- `ESPECIFICACION.md`: qué debe hacer la app (funciones, modelo de datos, pantallas, seguridad).
- `PLAN_FASES.md`: orden de trabajo por fases con criterios de aceptación.

## Estado del repositorio
El repo contiene un prototipo anterior en formato PWA (Vite). Está guardado en el commit `baedfb1` del historial (`git show baedfb1:ruta/archivo`). La Fase 0 lo elimina de `main` y lo sustituye por el proyecto móvil; se pueden reutilizar de ahí `src/utils/formato.js` y `src/utils/categoriasIniciales.js`.

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
  (auth)/                # login, registro
  (hogar)/               # crear hogar o unirse con código
  (tabs)/                # inicio, estadísticas, categorías, ajustes
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
- Moneda en euros, formato `1.234,56 €` con `Intl.NumberFormat('es-ES', { useGrouping: 'always' })`.
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

## Comandos (se rellenarán en la Fase 0)
- `npx expo start --dev-client`: servidor de desarrollo.
- `eas build --profile development --platform android`: build de desarrollo.
- `npm test`: tests de lógica.
- `npm run test:rules`: tests de reglas de Firestore con el emulador.
- `npm run lint`

## Flujo de trabajo
- Trabajar **una fase cada vez**, siguiendo `PLAN_FASES.md`.
- Al terminar cada fase: comprobar criterios de aceptación, explicar qué se ha hecho y cómo probarlo, y hacer commit en español.
- No empezar la fase siguiente sin confirmación del usuario.
- Si hay una decisión de diseño con varias opciones razonables, o algo que cueste dinero, preguntar antes.
- No añadir dependencias nuevas sin avisar y justificarlas.
- Mantener este archivo al día si cambian decisiones importantes.
