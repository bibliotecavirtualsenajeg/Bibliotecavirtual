# Biblioteca Virtual Institucional Jorge Eliecer Gaitan

Este es un proyecto de una biblioteca virtual simple, desarrollada con un backend de Node.js/Express y un frontend de Vanilla JavaScript. La aplicación permite a los usuarios con diferentes roles (Administrador, Profesor, Estudiante) interactuar con un catálogo de libros en formato PDF.

## Características

- **Autenticación de Usuarios:** Sistema de inicio de sesión basado en roles utilizando JWT.
- **Gestión de Usuarios (Admin):** Los administradores pueden crear y eliminar cuentas de usuario.
- **Gestión de Libros (Admin/Profesor):** Los administradores y profesores pueden subir nuevos libros (PDFs) y eliminarlos.
- **Catálogo de Libros:** Todos los usuarios autenticados pueden ver y leer los libros disponibles.
- **Estructura Separada:** El código está organizado en carpetas distintas para `frontend` y `backend`.

## Tecnologías Utilizadas

- **Backend:**
  - Node.js
  - Express
  - Mongoose (para interactuar con MongoDB)
  - JSON Web Tokens (JWT)
  - Multer (para la subida de archivos)
  - `dotenv` (para la gestión de variables de entorno)
  - `express-validator` (para la validación de datos de entrada)

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES Modules)
  - Bootstrap 5

- **Base de Datos:**
  - MongoDB (se recomienda una instancia en MongoDB Atlas)

## Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

**1. Clona el repositorio (o descomprime los archivos) en tu máquina local.**

**2. Configura las Variables de Entorno:**
   - Navega a la raíz del proyecto.
   - Crea un archivo llamado `.env`.
   - Añade las siguientes variables al archivo `.env`. Reemplaza los valores de ejemplo con tus propias credenciales.

   ```
   # Cadena de conexión a tu base de datos de MongoDB
   MONGO_URI="mongodb+srv://tu_usuario:tu_contraseña@tu_cluster.mongodb.net/tu_base_de_datos?retryWrites=true&w=majority"

   # Clave secreta para firmar los tokens JWT (puedes usar cualquier cadena segura)
   JWT_SECRET="tu_clave_secreta_aqui"
   ```

**3. Instala las Dependencias:**
   - Abre una terminal en la raíz del proyecto y ejecuta el siguiente comando para instalar todas las dependencias del backend:
   ```bash
   npm install
   ```

**4. Ejecuta el Servidor:**
   - Una vez instaladas las dependencias, inicia el servidor con:
   ```bash
   npm start
   ```
   - El servidor se iniciará en `http://localhost:5000` (o el puerto que hayas configurado).

**5. Accede a la Aplicación:**
   - Abre tu navegador web y ve a la siguiente dirección:
   ```
   http://localhost:5000
   ```
   - El servidor cargará automáticamente el frontend de la aplicación.

## Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo con `nodemon`, que se reinicia automáticamente cada vez que detecta un cambio en los archivos del backend.
- `npm run create-admin`: Ejecuta un script para crear un usuario administrador por defecto. Es útil para la configuración inicial de la aplicación.
