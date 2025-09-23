const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// @route   POST /api/users
// @desc    Crear un nuevo usuario (Estudiante o Profesor)
// @access  Private (Admin)
exports.createUser = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ msg: 'Por favor, ingrese todos los campos' });
    }

    if (role === 'Admin') {
        return res.status(400).json({ msg: 'No se puede crear un usuario con el rol de Administrador' });
    }

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword,
            role
        });

        await user.save();
        
        // Devolvemos el usuario creado (sin la contraseña)
        const createdUser = await User.findById(user.id).select('-password');
        res.status(201).json(createdUser);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   GET /api/users
// @desc    Obtener todos los usuarios
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   DELETE /api/users/:id
// @desc    Eliminar un usuario
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Usuario eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};