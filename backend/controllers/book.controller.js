
const Book = require('../models/book.model');
const fs = require('fs').promises;
const path = require('path');

// @route   POST /api/books
// @desc    Subir un nuevo libro
// @access  Private (Profesor or Admin)
exports.createBook = async (req, res) => {
    // console.log('--- Entrando en createBook Controller ---'); // Remove debugging logs
    // console.log('Request Body:', req.body);
    // console.log('Request Files:', req.files); // Change to req.files

    // Verificar si multer procesó los archivos
    if (!req.files || !req.files.file || req.files.file.length === 0) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo PDF o el tipo de archivo no es válido.' });
    }

    const { titulo, area } = req.body;
    const filePath = req.files.file[0].filename; // Get filename of PDF file
    const imagePath = req.files.image && req.files.image.length > 0 ? req.files.image[0].filename : undefined; // Get filename of image file (optional)

    try {
        const newBook = new Book({
            titulo,
            area,
            filePath,
            imagePath // Save image path
        });

        const book = await newBook.save();
        // console.log('Libro guardado en la BD:', book); // Remove debugging logs
        res.status(201).json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al guardar en la base de datos.');
    }
};

// @route   GET /api/books
// @desc    Obtener todos los libros
// @access  Private (Authenticated users)
exports.getBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   GET /api/books/:id
// @desc    Obtener un libro por ID
// @access  Private (Authenticated users)
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ msg: 'Libro no encontrado' });
        }
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   PUT /api/books/:id
// @desc    Actualizar un libro
// @access  Private (Profesor or Admin)
exports.updateBook = async (req, res) => {
    const { titulo, area } = req.body;
    const imageFile = req.files && req.files.image && req.files.image.length > 0 ? req.files.image[0] : undefined;

    try {
        let book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ msg: 'Libro no encontrado' });
        }

        book.titulo = titulo || book.titulo;
        book.area = area || book.area;

        if (imageFile) {
            // Si hay una imagen nueva, eliminar la anterior si existe
            if (book.imagePath) {
                const oldImagePath = path.join(__dirname, '..', 'uploads', book.imagePath);
                try {
                    await fs.unlink(oldImagePath);
                } catch (unlinkErr) {
                    // No es un error fatal si el archivo antiguo no existe
                    if (unlinkErr.code !== 'ENOENT') {
                        console.error('Error al eliminar la imagen antigua:', unlinkErr.message);
                    }
                }
            }
            // Guardar el nombre de la nueva imagen
            book.imagePath = imageFile.filename;
        }

        await book.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   DELETE /api/books/:id
// @desc    Eliminar un libro
// @access  Private (Profesor or Admin)
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ msg: 'Libro no encontrado' });
        }

        const uploadsDir = path.join(__dirname, '..', 'uploads');

        // Eliminar el libro de la base de datos
        await Book.findByIdAndDelete(req.params.id);

        // Intentar eliminar el archivo PDF
        if (book.filePath) {
            try {
                await fs.unlink(path.join(uploadsDir, book.filePath));
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error('Error al eliminar el archivo PDF:', err.message);
                }
            }
        }

        // Intentar eliminar la imagen
        if (book.imagePath) {
            try {
                await fs.unlink(path.join(uploadsDir, book.imagePath));
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error('Error al eliminar el archivo de imagen:', err.message);
                }
            }
        }

        res.json({ msg: 'Libro eliminado exitosamente' });

    } catch (err) {
        console.error("Error en deleteBook:", err.message);
        res.status(500).send('Error del servidor');
    }
};
