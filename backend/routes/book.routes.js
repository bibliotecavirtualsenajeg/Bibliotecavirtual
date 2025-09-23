const express = require('express');
const router = express.Router();
// const upload = require('../config/multer-config'); // No longer directly require here

module.exports = (uploadMiddleware) => { // Accept uploadMiddleware
    const bookController = require('../controllers/book.controller');
    const { auth, isProfesorOrAdmin } = require('../middleware/auth.middleware');
    const { bookValidationRules, validate } = require('../middleware/validation.middleware');

    // @route   POST /api/books
    // @desc    Subir un nuevo libro
    // @access  Private (Profesor or Admin)
    router.post('/', auth, isProfesorOrAdmin, uploadMiddleware.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), bookValidationRules(), validate, bookController.createBook);

    // @route   GET /api/books
    // @desc    Obtener todos los libros
    // @access  Private (Authenticated users)
    router.get('/', auth, bookController.getBooks);

    // @route   GET /api/books/:id
    // @desc    Obtener un libro por ID
    // @access  Private (Authenticated users)
    router.get('/:id', auth, bookController.getBookById);

    // @route   PUT /api/books/:id
    // @desc    Actualizar un libro
    // @access  Private (Profesor or Admin)
    router.put('/:id', auth, isProfesorOrAdmin, uploadMiddleware.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), bookValidationRules(), validate, bookController.updateBook);

    // @route   DELETE /api/books/:id
    // @access  Private (Profesor or Admin)
    router.delete('/:id', [auth, isProfesorOrAdmin], bookController.deleteBook);

    return router;
};