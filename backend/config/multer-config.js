
const path = require('path');
// const multer = require('multer'); // Remove this line

module.exports = (multerInstance, uploadDestination) => { // Accept multerInstance and uploadDestination
    // Use TEST_UPLOADS_DIR if available (for tests), otherwise use the provided uploadDestination
    const finalUploadDestination = process.env.TEST_UPLOADS_DIR || uploadDestination;

    // Configuración de almacenamiento
    // Storage for both PDF and image files
    const storage = multerInstance.diskStorage({
        destination: (req, file, cb) => {
            cb(null, finalUploadDestination);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });

    // File filter for PDF files
    const pdfFileFilter = (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos PDF'), false);
        }
    };

    // File filter for image files
    const imageFileFilter = (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten imágenes (jpeg, png, gif)'), false);
        }
    };

    // Multer can take a single fileFilter function that checks the fieldname.
    const combinedFileFilter = (req, file, cb) => {
        if (file.fieldname === 'file') { // PDF file
            pdfFileFilter(req, file, cb);
        } else if (file.fieldname === 'image') { // Image file
            imageFileFilter(req, file, cb);
        } else {
            cb(new Error('Tipo de campo de archivo no válido'), false);
        }
    };

    const configuredUpload = multerInstance({
        storage: storage,
        fileFilter: combinedFileFilter,
        limits: { fileSize: 1024 * 1024 * 50 } // Límite de 50MB for each file
    });

    return configuredUpload; // Return the configured multer instance
};
