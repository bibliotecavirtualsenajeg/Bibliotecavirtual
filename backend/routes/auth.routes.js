
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginValidationRules, validate } = require('../middleware/validation.middleware');

// @route   POST /api/auth/login
// @desc    Login de usuario
// @access  Public
router.post('/login', [loginValidationRules(), validate], authController.login);

module.exports = router;
