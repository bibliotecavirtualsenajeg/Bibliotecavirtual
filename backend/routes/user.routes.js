
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');
const { userValidationRules, validate } = require('../middleware/validation.middleware');

// @route   POST /api/users
// @desc    Crear un nuevo usuario (Estudiante o Profesor)
// @access  Private (Admin)
router.post('/', [auth, isAdmin, userValidationRules(), validate], userController.createUser);

// @route   GET /api/users
// @desc    Obtener todos los usuarios
// @access  Private (Admin)
router.get('/', [auth, isAdmin], userController.getUsers);

// @route   DELETE /api/users/:id
// @desc    Eliminar un usuario
// @access  Private (Admin)
router.delete('/:id', [auth, isAdmin], userController.deleteUser);

module.exports = router;
