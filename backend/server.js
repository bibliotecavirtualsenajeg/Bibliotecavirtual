
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer'); // Require multer here

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos (MongoDB Atlas)
// Solo conectar a la base de datos si el archivo se ejecuta directamente (no durante las pruebas)
if (require.main === module) {
  const uri = process.env.MONGO_URI;
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const connection = mongoose.connection;
  connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
  });
}


// Servir frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Pass the multer instance and the default uploads directory to multer-config
const uploadMiddleware = require('./config/multer-config')(multer, path.join(__dirname, 'uploads'));
app.use('/api/books', require('./routes/book.routes')(uploadMiddleware));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Solo iniciar el servidor si el archivo se ejecuta directamente
if (require.main === module) {
  app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
  });
}

module.exports = app; // Exportar para pruebas

