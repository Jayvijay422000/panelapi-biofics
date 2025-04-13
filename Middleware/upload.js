const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const filetypes = /csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: CSV Files Only!');
    }
};

// Upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB
    fileFilter: fileFilter
});

module.exports = upload;
