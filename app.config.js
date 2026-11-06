// Configuración de la app para Expo y EAS.
// Es un .js (y no app.json) para poder leer la ruta de google-services.json
// desde una variable de entorno: en los builds de EAS el archivo llega como
// "file secret" (GOOGLE_SERVICES_JSON) y nunca se guarda en el repositorio.

/** Nombre de paquete Android. NO se puede cambiar después de publicar en Play. */
const PAQUETE_ANDROID = 'com.parzival8.controlcasa';

module.exports = {
  expo: {
    name: 'Control Casa',
    slug: 'control-casa',
    owner: 'parzival8',
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'controlcasa',
    // Tema claro u oscuro según el sistema.
    userInterfaceStyle: 'automatic',
    android: {
      package: PAQUETE_ANDROID,
      // En EAS: ruta al file secret. En local: copia propia (ignorada por git).
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
    },
    plugins: [
      'expo-router',
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
    ],
    experiments: {
      typedRoutes: false,
    },
    extra: {
      eas: {
        projectId: 'a8fe5364-9e2b-4434-86f9-c2f05bd2f145',
      },
    },
  },
};
