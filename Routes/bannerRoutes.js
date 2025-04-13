// // Routes/bannerRoutes.js
// const express = require('express');
// const router = express.Router();
// const bannerController = require('../Controller/bannerConhtroller');
// const multer = require('multer');

// // Multer configuration to store image in memory
// const storage = multer.memoryStorage(); // Store the file in memory
// const upload = multer({ storage });

// // Route to add a banner photo
// router.post('/add-photo', upload.single('photo'), bannerController.addBannerPhoto);



// // Route to get all banners (returns banner IDs and other metadata, not the photos themselves)
// router.get('/banners', bannerController.getAllBannerPhotos);

// module.exports = router;









const express = require('express');
const { getAllBannerPhotos, addBannerPhoto, editBannerPhoto, deleteBannerPhoto } = require('../Controller/bannerController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the storage location and file handling for multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Path to the FRONTEND public folder
//         cb(null, path.join('D:/bio-gas/FRONTEND__24092024/public/banner')); // Use forward slashes for cross-platform compatibility
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//     }
// });


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       // const uploadPath = path.join('/public/banner');
		const uploadPath = path.join(__dirname, '..', 'public', 'banner');
      	console.log('Upload Path:', uploadPath); 

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});


// Set up multer with file size and type restrictions
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg','image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
        }
        cb(null, true);
    }
});

// Initialize the express router
const router = express.Router();

// Route to get all banner photos
router.get('/banners', getAllBannerPhotos);

// Route to upload a new banner photo
router.post('/add-photo', upload.single('photo'), addBannerPhoto);

// Route to edit an existing banner photo (by ID)
router.put('/:id', upload.single('photo'), editBannerPhoto);

// Define the routes for deleting a banner
router.delete('/:id', deleteBannerPhoto); // Delete banner photo by ID


module.exports = router;













// const express = require('express');
// const { getAllBannerPhotos, addBannerPhoto } = require('../Controller/bannerController');
// const multer = require('multer');
// const path = require('path');

// // Define the storage location and file handling for multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Update the path to the FRONTEND public folder
//         cb(null, path.join('D:/bio-gas/FRONTEND__24092024/public/banner')); // Use forward slashes for cross-platform compatibility
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//     }
// });



// // Set up multer with file size and type restrictions
// const upload = multer({
//     storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
//         if (!allowedTypes.includes(file.mimetype)) {
//             return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
//         }
//         cb(null, true);
//     }
// });

// // Initialize the express router
// const router = express.Router();

// // Route to get all banner photos
// router.get('/banners', getAllBannerPhotos);

// // Route to upload a new banner photo, using multer middleware
// router.post('/add-photo', upload.single('photo'), addBannerPhoto);

// module.exports = router;