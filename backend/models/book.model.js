
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    area: {
        type: String,
        required: true,
        trim: true
    },
    filePath: {
        type: String,
        required: true
    },
    imagePath: { // New field for image path
        type: String,
        required: false // Image is optional
    }
}, {
    timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
