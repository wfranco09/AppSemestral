# KidinTime

<p align="center">
  <img src="assets/images/logo-kidintime.png" alt="Logo de KidinTime" width="260">
</p>

<p align="center">
  Aplicación móvil educativa de dibujo y coloreado desarrollada con React Native y Expo.
</p>

## Descripción general

**KidinTime** es una aplicación móvil orientada a niños que permite seleccionar diferentes ilustraciones de animales, colorearlas mediante herramientas de dibujo y guardar las creaciones directamente en el dispositivo.

La aplicación ofrece un flujo sencillo y amigable: presenta una pantalla de bienvenida, solicita el nombre del usuario, muestra un menú personalizado y permite acceder al editor, la galería y el perfil. Toda la información se conserva localmente, por lo que no requiere conexión con una API, servidor externo o base de datos remota.

Este proyecto fue desarrollado como aplicación semestral utilizando **React Native**, **Expo** y **Expo Router**.

## Objetivo del proyecto

El objetivo de KidinTime es ofrecer un espacio digital interactivo donde los usuarios puedan desarrollar su creatividad mediante actividades de dibujo y coloreado, utilizando una interfaz visual sencilla, navegación clara y almacenamiento local de sus creaciones.

## Estado analizado

- **Repositorio:** `wfranco09/AppSemestral`
- **Rama:** `feature/user-welcome-flow`
- **Último commit revisado:** `b297c29694d6114af1f0c6197c6c2a5f756ab180`
- **Versión de la aplicación:** `1.0.0`
- **Expo SDK:** `54`

## Funcionalidades principales

### 1. Flujo de bienvenida y registro

Al iniciar la aplicación, el usuario atraviesa el siguiente flujo:

```text
Inicio de la aplicación
        ↓
Pantalla de bienvenida
        ↓
Pantalla de registro
        ↓
Menú principal
```

La pantalla de bienvenida se muestra durante aproximadamente 1.5 segundos antes de dirigir al usuario hacia el registro.

En la pantalla de registro:

- El usuario introduce su nombre.
- El campo acepta un máximo de 20 caracteres.
- El nombre se normaliza antes de guardarse.
- Los espacios repetidos se reducen a un solo espacio.
- No se permite continuar con un nombre vacío.
- El teclado no aparece automáticamente; se abre únicamente cuando el usuario toca el campo.
- El botón cambia temporalmente a `Guardando...` mientras se procesa la información.
- Si ya existe un nombre guardado, se carga nuevamente en el campo.

### 2. Persistencia del usuario

El nombre del usuario se almacena mediante **AsyncStorage**, utilizando la clave:

```text
kidintime_user_name
```

Esto permite conservar el nombre incluso después de cerrar y volver a abrir la aplicación.

La aplicación trabaja actualmente con **un único perfil activo**. Al registrar un nuevo nombre después de borrar el perfil anterior, se crea una sesión local nueva.

### 3. Menú principal personalizado

La pantalla de inicio muestra:

- Logo de KidinTime.
- Mensaje personalizado con el nombre almacenado.
- Cuatro opciones de animales:
  - Dinosaurio.
  - Koala.
  - Gato.
  - León.
- Opción adicional de lienzo libre.
- Acceso directo al editor mediante cada tarjeta.

Ejemplo del saludo:

```text
Bienvenido,
Joseph
```

El nombre se vuelve a cargar cada vez que la pantalla recibe el foco, garantizando que la información visible esté actualizada.

### 4. Editor de dibujo

El editor permite colorear una ilustración seleccionada o trabajar sobre un lienzo en blanco.

#### Plantillas disponibles

- Dinosaurio.
- Koala.
- Gato.
- León.
- Lienzo libre.

Cada opción posee una imagen y un título asociado. Cuando se selecciona el lienzo libre, no se muestra imagen de fondo.

#### Herramientas disponibles

- Lápiz.
- Borrador.
- Limpieza completa del lienzo.
- Paleta de colores.
- Selector de tamaño del pincel.
- Guardado del dibujo.
- Reapertura de dibujos guardados.
- Navegación hacia Inicio, Galería y Perfil.

#### Paleta de colores

La aplicación incluye los siguientes colores:

- Rojo.
- Azul.
- Verde.
- Naranja.
- Rosado.
- Verde turquesa.
- Morado.
- Negro.

#### Tamaño del pincel

El grosor del pincel se controla mediante un selector horizontal. El valor permitido se encuentra entre:

```text
Mínimo: 2
Máximo: 30
```

#### Representación de los trazos

Los trazos se almacenan como arreglos de puntos con coordenadas `x` y `y`.

Cada trazo guarda:

```js
{
  id,
  color,
  strokeWidth,
  points
}
```

Los trazos del borrador se almacenan por separado y se aplican mediante máscaras SVG para ocultar las partes correspondientes del dibujo.

### 5. Detección de cambios sin guardar

Cuando el usuario dibuja o utiliza el borrador, la aplicación registra que existen cambios pendientes.

Si intenta abandonar el editor utilizando la barra inferior antes de guardar, se muestra una alerta de confirmación:

```text
¿Salir?
Los cambios no se guardarán.
```

El usuario puede cancelar la navegación o salir y descartar los cambios.

### 6. Guardado de dibujos

El editor permite guardar una creación únicamente cuando existe al menos un trazo.

Cada dibujo conserva:

```js
{
  id,
  animalId,
  animalLabel,
  fecha,
  strokes,
  eraserStrokes,
  canvasWidth,
  canvasHeight,
  thumbnailUri
}
```

Los datos estructurados se almacenan en AsyncStorage mediante la clave:

```text
kidintime_dibujos
```

Los dibujos se ordenan por fecha, mostrando primero los más recientes.

### 7. Generación de miniaturas

Al guardar un dibujo, la aplicación captura visualmente el lienzo mediante `react-native-view-shot`.

La imagen generada se copia al directorio local:

```text
FileSystem.documentDirectory/dibujos/
```

La ruta del archivo se guarda en `thumbnailUri`.

Cuando un dibujo existente se edita y se vuelve a guardar:

- Se mantiene el mismo identificador.
- Se actualizan los trazos.
- Se genera una miniatura nueva.
- Se elimina la miniatura anterior cuando corresponde.
- Se actualiza la fecha de modificación.

### 8. Galería de dibujos

La pantalla de galería incluye:

- Logo de KidinTime.
- Estado de carga.
- Mensaje para galería vacía.
- Cuadrícula de dos columnas.
- Miniatura de cada dibujo.
- Nombre de la plantilla utilizada.
- Fecha de guardado o modificación.
- Botón individual para eliminar.
- Acceso al editor tocando una creación.

Cuando se abre un dibujo desde la galería, se envían al editor:

```js
{
  drawingId,
  animal
}
```

Esto permite restaurar la plantilla, los trazos y las acciones del borrador.

### 9. Eliminación individual de dibujos

Cada dibujo tiene un botón de eliminación.

Antes de eliminarlo se muestra una confirmación. Si el usuario acepta:

- Se elimina la miniatura almacenada en el sistema de archivos.
- Se elimina el registro de AsyncStorage.
- Se actualiza inmediatamente la galería.

La eliminación utiliza la opción `idempotent`, por lo que no falla si la imagen ya no existe físicamente.

### 10. Perfil del usuario

La pantalla de perfil muestra:

- Logo de KidinTime.
- Inicial del nombre en un avatar.
- Nombre del usuario.
- Cantidad total de dibujos.
- Vista previa de los tres dibujos más recientes.
- Nombre y fecha de cada dibujo reciente.
- Acceso directo a un dibujo reciente.
- Botón `Ver tu galería de dibujos`.
- Botón `Borrar perfil`.

Si no existen dibujos, se presenta un estado vacío con una explicación para el usuario.

### 11. Eliminación del perfil

El botón `Borrar perfil` muestra una confirmación antes de ejecutar la acción.

Al confirmar:

1. Se eliminan todas las miniaturas.
2. Se vacía la colección `kidintime_dibujos`.
3. Se elimina el nombre guardado.
4. Se regresa a la pantalla de bienvenida.
5. El siguiente usuario comienza con una galería vacía.

Esta acción es permanente y no puede deshacerse.

### 12. Barra de navegación inferior

La aplicación posee una barra inferior reutilizable con tres destinos:

- Inicio.
- Galería.
- Perfil.

La barra:

- Utiliza un único componente compartido.
- Resalta visualmente la ruta activa.
- Respeta el área segura del dispositivo.
- Se oculta cuando aparece el teclado.
- Está presente en Inicio, Galería, Perfil y Editor.
- No aparece en Bienvenida ni Registro.

## Flujo general de navegación

```text
/
└── Bienvenida
    └── Registro
        └── Inicio
            ├── Editor
            │   ├── Guardar
            │   ├── Seguir pintando
            │   └── Ir a Galería
            ├── Galería
            │   ├── Abrir dibujo
            │   └── Borrar dibujo
            └── Perfil
                ├── Abrir dibujo reciente
                ├── Ver galería
                └── Borrar perfil
```

## Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| React 19 | Construcción de componentes y administración del estado |
| React Native 0.81 | Desarrollo de la interfaz móvil |
| Expo SDK 54 | Entorno de desarrollo y ejecución |
| Expo Router | Navegación basada en archivos |
| AsyncStorage | Persistencia del nombre y datos de dibujos |
| Expo FileSystem | Administración de miniaturas locales |
| React Native Gesture Handler | Captura de gestos sobre el lienzo |
| React Native SVG | Representación de trazos, máscaras y borrado |
| React Native View Shot | Captura del lienzo para generar miniaturas |
| React Native Safe Area Context | Adaptación de interfaz a áreas seguras |
| ESLint | Revisión de calidad y estilo del código |
| TypeScript | Configuración de tipos y rutas, aunque las pantallas principales utilizan JavaScript |

## Dependencias principales

```json
{
  "expo": "~54.0.34",
  "expo-router": "~6.0.23",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@react-native-async-storage/async-storage": "2.2.0",
  "expo-file-system": "~19.0.23",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-svg": "15.12.1",
  "react-native-view-shot": "4.0.3"
}
```

## Estructura principal del proyecto

```text
AppSemestral/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.js
│   │   ├── inicio.js
│   │   ├── galeria.js
│   │   └── perfil.js
│   ├── Bienvenida.js
│   ├── Registro.js
│   ├── draw.js
│   └── index.js
├── assets/
│   └── images/
│       ├── logo-kidintime.png
│       ├── Inicio.png
│       ├── Registro.png
│       ├── Dino.jpg
│       ├── koala.jpg
│       ├── Gato.jpg
│       ├── Leon.png
│       ├── Dinotext.png
│       ├── KoalaText1.png
│       ├── GatoText.png
│       ├── LeonText.png
│       ├── ColorearText.png
│       ├── lapiz.png
│       ├── borrador.jpeg
│       ├── restar.jpeg
│       ├── inicio1.png
│       ├── galeria.png
│       └── user.png
├── components/
│   └── BottomNavBar.js
├── utils/
│   ├── animalAssets.js
│   ├── drawings.js
│   ├── navigation.js
│   ├── storage.js
│   └── userSession.js
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Responsabilidad de los archivos principales

### `app/index.js`

Punto de entrada de Expo Router. Redirige hacia la pantalla de bienvenida.

### `app/Bienvenida.js`

Muestra la presentación inicial y navega automáticamente al registro después de 1.5 segundos.

### `app/Registro.js`

Administra la captura, validación y persistencia del nombre.

### `app/(tabs)/inicio.js`

Presenta el menú principal, el saludo personalizado, las plantillas y el acceso al lienzo libre.

### `app/draw.js`

Contiene la lógica principal del editor:

- Captura de gestos.
- Construcción de trazos.
- Borrador mediante máscaras.
- Selección de herramientas.
- Selección de color y grosor.
- Captura de miniaturas.
- Guardado y edición.
- Control de cambios sin guardar.
- Navegación compartida.

### `app/(tabs)/galeria.js`

Carga, valida, organiza, abre y elimina dibujos guardados.

### `app/(tabs)/perfil.js`

Carga la información del usuario y los dibujos, genera el resumen del perfil y permite eliminar toda la información asociada.

### `app/(tabs)/_layout.js`

Configura las pestañas de Expo Router y reemplaza la barra predeterminada por `BottomNavBar`.

### `components/BottomNavBar.js`

Define la barra inferior reutilizable y el estado visual de la ruta activa.

### `utils/storage.js`

Proporciona funciones genéricas para:

- Guardar valores.
- Leer valores.
- Eliminar valores.

### `utils/userSession.js`

Administra el nombre del usuario:

- `getSavedUserName()`.
- `saveUserName(name)`.
- `clearUserProfile()`.

### `utils/drawings.js`

Administra la persistencia de dibujos:

- `getDrawings()`.
- `getDrawingById(id)`.
- `saveDrawing(data)`.
- `deleteDrawing(id)`.
- `deleteAllDrawings()`.

### `utils/animalAssets.js`

Centraliza las opciones de animales y sus imágenes.

### `utils/navigation.js`

Muestra la confirmación al salir del editor cuando existen cambios sin guardar.

## Persistencia y almacenamiento

KidinTime utiliza almacenamiento completamente local.

### AsyncStorage

| Clave | Contenido |
|---|---|
| `kidintime_user_name` | Nombre del usuario activo |
| `kidintime_dibujos` | Arreglo con la información de los dibujos |

### Sistema de archivos

Las miniaturas se guardan dentro del directorio privado de la aplicación:

```text
documentDirectory/dibujos/
```

Los datos no se sincronizan entre dispositivos y se perderán si el usuario elimina los datos de la aplicación o desinstala Expo Go durante las pruebas.

## Requisitos previos

Antes de ejecutar el proyecto se necesita:

- Node.js.
- npm.
- Git.
- Visual Studio Code u otro editor.
- Expo Go en un dispositivo móvil, o un emulador compatible.
- Teléfono y computadora conectados a la misma red para la conexión local.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/wfranco09/AppSemestral.git
```

### 2. Entrar al proyecto

```bash
cd AppSemestral
```

### 3. Cambiar a la rama de trabajo

```bash
git switch feature/user-welcome-flow
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Verificar el código

```bash
npm run lint
```

### 6. Iniciar Expo

```bash
npx expo start --clear
```

## Ejecución con Expo Go

1. Instalar Expo Go en el teléfono.
2. Ejecutar:

```bash
npx expo start --clear
```

3. Esperar a que aparezca el código QR.
4. Abrir Expo Go.
5. Escanear el código QR.
6. Esperar a que Metro compile el proyecto.

Si la conexión local no funciona:

```bash
npx expo start --tunnel
```

El modo túnel puede tardar más, pero es útil cuando la red bloquea las conexiones locales.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia Expo |
| `npm run android` | Inicia el proyecto para Android |
| `npm run ios` | Inicia el proyecto para iOS |
| `npm run web` | Inicia la versión web |
| `npm run lint` | Ejecuta ESLint |
| `npm run reset-project` | Ejecuta el script de reinicio del proyecto |

## Pruebas funcionales recomendadas

### Registro

- Confirmar que el teclado no aparezca automáticamente.
- Confirmar que no se pueda continuar con un campo vacío.
- Registrar un nombre con espacios repetidos.
- Cerrar y volver a abrir la aplicación.
- Verificar que el nombre guardado vuelva a mostrarse.

### Inicio

- Verificar el saludo personalizado.
- Abrir cada plantilla.
- Abrir el lienzo libre.
- Confirmar que todas las imágenes correspondan al animal seleccionado.

### Editor

- Dibujar con cada color.
- Cambiar el tamaño del pincel.
- Utilizar el borrador.
- Limpiar el lienzo.
- Intentar guardar sin trazos.
- Guardar un dibujo válido.
- Salir con cambios sin guardar.
- Cancelar y confirmar la alerta de salida.

### Galería

- Confirmar la aparición de la miniatura.
- Abrir un dibujo.
- Editarlo y volver a guardarlo.
- Verificar que se actualice la miniatura.
- Eliminar un dibujo.
- Confirmar el estado de galería vacía.

### Perfil

- Verificar el nombre y la inicial.
- Confirmar el contador de dibujos.
- Verificar las tres creaciones más recientes.
- Abrir una vista previa.
- Abrir la galería desde el botón.
- Borrar el perfil.
- Confirmar que el nuevo usuario tenga una galería vacía.

## Solución de problemas

### `expo/tsconfig.base` aparece en rojo

Ejecutar:

```bash
npm install
```

Después reiniciar el servidor de TypeScript desde Visual Studio Code:

```text
Ctrl + Shift + P
TypeScript: Restart TS Server
```

### Metro conserva una versión anterior

Ejecutar:

```bash
npx expo start --clear
```

### El teléfono no conecta con Expo

Confirmar que ambos dispositivos estén en la misma red o ejecutar:

```bash
npx expo start --tunnel
```

### El nombre antiguo continúa apareciendo

Borrar el perfil desde la pantalla Perfil o limpiar los datos de Expo Go desde los ajustes del dispositivo.

### Las miniaturas no aparecen

Revisar:

- Que el dibujo haya sido guardado.
- Que `thumbnailUri` tenga una ruta válida.
- Que Expo Go conserve los permisos y datos de la aplicación.
- Que los datos de Expo Go no hayan sido limpiados.

## Flujo de trabajo con Git

Se recomienda no trabajar directamente sobre `master` ni sobre la rama de integración.

### Crear una rama

```bash
git switch feature/user-welcome-flow
git pull origin feature/user-welcome-flow
git switch -c feature/nombre-de-la-funcion
```

### Guardar cambios

```bash
git add .
git commit -m "Descripción clara del cambio"
```

### Subir la rama

```bash
git push -u origin feature/nombre-de-la-funcion
```

Después se recomienda crear un Pull Request hacia la rama de integración correspondiente.

## Limitaciones actuales

- Solo existe un perfil activo por dispositivo.
- Los datos se almacenan únicamente de forma local.
- No existe autenticación con contraseña.
- No existe sincronización en la nube.
- No existe respaldo automático.
- No existe separación de dibujos entre varios perfiles simultáneos.
- La eliminación del perfil y los dibujos es permanente.
- La experiencia principal está diseñada para dispositivos móviles.

## Posibles mejoras futuras

- Soporte para varios perfiles independientes.
- Asociación de dibujos a un identificador de perfil.
- Selector de avatar.
- Exportación de dibujos a la galería del teléfono.
- Compartir dibujos.
- Deshacer y rehacer trazos.
- Más plantillas.
- Nuevas paletas.
- Relleno de áreas.
- Autoguardado.
- Copias de seguridad.
- Sincronización mediante una API.
- Control parental.
- Estadísticas de uso y progreso creativo.
- Soporte completo para tabletas.
- Pruebas automatizadas.

## Consideraciones de privacidad

La aplicación no envía el nombre ni los dibujos a servicios externos. La información permanece dentro del almacenamiento local del dispositivo utilizado para ejecutar la aplicación.

No deben incorporarse datos sensibles sin implementar previamente controles adicionales de seguridad, consentimiento y protección de información.

## Uso académico

Este proyecto fue desarrollado con fines académicos como aplicación semestral. Antes de distribuirlo públicamente o utilizarlo comercialmente, el equipo debe revisar:

- Licencia del proyecto.
- Licencias de imágenes y recursos gráficos.
- Política de privacidad.
- Términos de uso.
- Pruebas en dispositivos reales.
- Accesibilidad.
- Requisitos de publicación de Google Play y App Store.

## Equipo

Proyecto desarrollado por el equipo responsable de **KidinTime / AppSemestral**.
