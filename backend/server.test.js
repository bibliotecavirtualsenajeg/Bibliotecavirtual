const request = require('supertest');
require('dotenv').config(); // Load environment variables

const mongoose = require('mongoose');
const User = require('./models/user.model');
const Book = require('./models/book.model'); // Import Book model
const bcrypt = require('bcryptjs');
const fs = require('fs').promises; // For file system operations
const path = require('path');
const os = require('os'); // Import os module

// Define paths for test files
const DUMMY_PDF_PATH = path.join(__dirname, '../test_files/dummy.pdf');
let TEST_UPLOADS_DIR; // Will be a unique temporary directory

describe('Pruebas para la API de la Biblioteca', () => {
  let app; // Declare app here
  let adminToken;
  let profesorToken;
  let studentToken; // New token for student user
  let testBookId; // To store the ID of a created book for updates/deletes

  // Antes de todas las pruebas, creamos usuarios de prueba y preparamos el entorno
  beforeAll(async () => {
    // Create a unique temporary directory for uploads for this test run
    TEST_UPLOADS_DIR = path.join(os.tmpdir(), `test_uploads_${Date.now()}`);
    await fs.mkdir(TEST_UPLOADS_DIR, { recursive: true });

    // Set an environment variable for the test uploads directory
    process.env.TEST_UPLOADS_DIR = TEST_UPLOADS_DIR;

    // Now require the app, which will use the TEST_UPLOADS_DIR for multer
    app = require('./server'); // Require app after setting env var

    // Conectar a la base de datos de prueba
    if (mongoose.connection.readyState === 1) { // If already connected, disconnect first
      await mongoose.disconnect();
    }
    await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });

    // Limpiar la base de datos por si hay datos de pruebas anteriores
    await User.deleteMany({});
    await Book.deleteMany({});

    // Crear un usuario Administrador
    const adminPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPasswordAdmin = await bcrypt.hash(adminPassword, salt);
    await new User({ username: 'testadmin', password: hashedPasswordAdmin, role: 'Admin' }).save();

    // Crear un usuario Profesor
    const profesorPassword = 'profesor123';
    const hashedPasswordProfesor = await bcrypt.hash(profesorPassword, salt);
    await new User({ username: 'testprofesor', password: hashedPasswordProfesor, role: 'Profesor' }).save();

    // Crear un usuario Estudiante
    const studentPassword = 'student123';
    const hashedPasswordStudent = await bcrypt.hash(studentPassword, salt);
    await new User({ username: 'teststudent', password: hashedPasswordStudent, role: 'Estudiante' }).save();

    // No need to clean UPLOADS_DIR here, as it's a new temporary directory
    // and will be cleaned in afterAll
  });

  // Después de todas las pruebas, limpiamos la base de datos, archivos y cerramos la conexión
  afterAll(async () => {
    await User.deleteMany({});
    await Book.deleteMany({});
    // Limpiar el directorio de uploads temporal
    if (await fs.access(TEST_UPLOADS_DIR).then(() => true).catch(() => false)) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add a small delay
      await fs.rm(TEST_UPLOADS_DIR, { recursive: true, force: true });
    }
    await mongoose.connection.close();
  });

  // --- Pruebas para Autenticación ---
  describe('POST /api/auth/login', () => {
    it('debería devolver un error de validación 422 si no se envían datos', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('errors');
    });

    it('debería devolver un error 400 con credenciales incorrectas', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'testadmin', password: 'wrongpassword' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'Credenciales no válidas');
    });

    it('debería autenticar a un usuario admin con credenciales correctas y devolver un token', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'testadmin', password: 'admin123' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      adminToken = res.body.token;
    });

    it('debería autenticar a un profesor y guardar su token', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'testprofesor', password: 'profesor123' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      profesorToken = res.body.token;
    });

    it('debería autenticar a un estudiante y guardar su token', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'teststudent', password: 'student123' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      studentToken = res.body.token;
    });
  });

  // --- Pruebas para Libros ---
  describe('GET /api/books', () => {
    it('debería devolver un error 401 si no se provee un token de autenticación', async () => {
      const res = await request(app).get('/api/books');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('msg', 'No hay token, autorización denegada');
    });

    it('debería devolver una lista de libros para un usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/books')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/books', () => {
    it('un admin debería poder subir un nuevo libro', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-auth-token', adminToken)
        .field('titulo', 'Libro de Prueba Admin')
        .field('area', 'Testing')
        .attach('file', DUMMY_PDF_PATH);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('titulo', 'Libro de Prueba Admin');
      expect(res.body).toHaveProperty('filePath');
      testBookId = res.body._id;

      const uploadedFileName = path.basename(res.body.filePath);
      const uploadedFilePath = path.join(TEST_UPLOADS_DIR, uploadedFileName);
      await expect(fs.access(uploadedFilePath)).resolves.toBeUndefined();
    });

    it('un profesor debería poder subir un nuevo libro', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-auth-token', profesorToken)
        .field('titulo', 'Libro de Prueba Profesor')
        .field('area', 'Educacion')
        .attach('file', DUMMY_PDF_PATH);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('titulo', 'Libro de Prueba Profesor');
      expect(res.body).toHaveProperty('filePath');
    });

    

    it('debería devolver un error 422 si faltan campos al subir un libro', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('x-auth-token', adminToken)
        .field('area', 'Testing')
        .attach('file', DUMMY_PDF_PATH);
      
      expect(res.statusCode).toEqual(422);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/books/:id', () => {
    it('un admin debería poder actualizar un libro', async () => {
      const res = await request(app)
        .put(`/api/books/${testBookId}`)
        .set('x-auth-token', adminToken)
        .send({ titulo: 'Libro de Prueba Admin Actualizado', area: 'Testing Avanzado' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('titulo', 'Libro de Prueba Admin Actualizado');
      expect(res.body).toHaveProperty('area', 'Testing Avanzado');
    });

    it('un estudiante no debería poder actualizar un libro', async () => {
      const res = await request(app)
        .put(`/api/books/${testBookId}`)
        .set('x-auth-token', studentToken)
        .send({ titulo: 'Intento de Estudiante' });
      
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('msg', 'Acceso denegado. Se requiere rol de Administrador o Profesor.');
    });

    it('debería devolver un error 404 si el libro no existe', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/books/${nonExistentId}`)
        .set('x-auth-token', adminToken)
        .send({ titulo: 'No existe', area: 'Cualquiera' }); // Add 'area'
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('msg', 'Libro no encontrado');
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('un admin debería poder eliminar un libro', async () => {
      // Creamos un libro adicional para eliminar
      const bookToDeleteRes = await request(app)
        .post('/api/books')
        .set('x-auth-token', adminToken)
        .field('titulo', 'Libro a Eliminar')
        .field('area', 'Temporal')
        .attach('file', DUMMY_PDF_PATH);
      
      const bookToDeleteId = bookToDeleteRes.body._id;
      const bookToDeleteFilePath = bookToDeleteRes.body.filePath;

      const res = await request(app)
        .delete(`/api/books/${bookToDeleteId}`)
        .set('x-auth-token', adminToken);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Libro eliminado exitosamente');

      // Verificamos que el libro ya no existe en la BD
      const foundBook = await Book.findById(bookToDeleteId);
      expect(foundBook).toBeNull();

      // Verificar que el archivo físico también fue eliminado
      await expect(fs.access(bookToDeleteFilePath)).rejects.toThrow('ENOENT');
    });

    it('un estudiante no debería poder eliminar un libro', async () => {
      const res = await request(app)
        .delete(`/api/books/${testBookId}`) // Intentamos eliminar el libro creado por el admin
        .set('x-auth-token', studentToken);
      
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('msg', 'Acceso denegado. Se requiere rol de Administrador o Profesor.');
    });

    it('debería devolver un error 404 si se intenta eliminar un libro que no existe', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/books/${nonExistentId}`)
        .set('x-auth-token', adminToken);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('msg', 'Libro no encontrado');
    });
  });

  // --- Pruebas para Usuarios ---
  describe('/api/users', () => {
    it('un admin debería poder crear un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('x-auth-token', adminToken)
        .send({
          username: 'newstudent',
          password: 'password123',
          role: 'Estudiante'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('username', 'newstudent');
    });

    it('un no-admin no debería poder crear un usuario', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('x-auth-token', profesorToken)
        .send({
          username: 'anotherstudent',
          password: 'password123',
          role: 'Estudiante'
        });
      
      expect(res.statusCode).toEqual(403);
    });

    it('un admin debería poder eliminar un usuario', async () => {
      // Primero creamos un usuario para eliminar
      const userToDelete = await new User({ username: 'todelete', password: 'password', role: 'Estudiante' }).save();

      const res = await request(app)
        .delete(`/api/users/${userToDelete._id}`)
        .set('x-auth-token', adminToken);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Usuario eliminado');

      // Verificamos que el usuario ya no existe en la BD
      const foundUser = await User.findById(userToDelete._id);
      expect(foundUser).toBeNull();
    });
  });
});