
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usar el mismo secreto que en auth.controller
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token no es válido' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
    next();
};

const isProfesorOrAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Profesor') {
        return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de Administrador o Profesor.' });
    }
    next();
};

module.exports = { auth, isAdmin, isProfesorOrAdmin };
