const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

const bookValidationRules = () => {
  return [
    body('titulo').notEmpty().withMessage('El título es obligatorio.'),
    body('area').notEmpty().withMessage('El área es obligatoria.'),
  ];
};

const userValidationRules = () => {
  return [
    body('username').notEmpty().withMessage('El nombre de usuario es obligatorio.'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    body('role').isIn(['Admin', 'Profesor', 'Estudiante']).withMessage('El rol no es válido.'),
  ];
};

const loginValidationRules = () => {
  return [
    body('username').notEmpty().withMessage('El nombre de usuario es obligatorio.'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  ];
};


module.exports = {
  validate,
  bookValidationRules,
  userValidationRules,
  loginValidationRules,
};
