// const Banner = require('../Models/Banner'); // Adjust the import path based on your project structure

// // Controller function to fetch all banner photos
// const getAllBannerPhotos = async (req, res) => {
//     try {
//         const banners = await Banner.findAll({
//             attributes: ['id', 'createdAt', 'photo'],
//         });

//         res.status(200).json(banners);
//     } catch (error) {
//         console.error('Error fetching all banner photos:', error);
//         res.status(500).json({ error: 'An error occurred while fetching banner photos.' });
//     }
// };

// // Controller function to add a new banner photo
// const addBannerPhoto = async (req, res) => {
//     try {
//         const { file } = req; // Access the uploaded file

//         // Validate that a file is uploaded
//         if (!file) {
//             return res.status(400).json({ error: 'Photo is required.' });
//         }

//         // Save the file path to the database (relative to the public folder)
//         const newBanner = await Banner.create({ photo: `/banner/${file.filename}` });

//         res.status(201).json(newBanner);
//     } catch (error) {
//         console.error('Error adding banner photo:', error); // Log the complete error
//         res.status(500).json({ error: 'An error occurred while adding the banner photo.', details: error.message });
//     }
// };

// // Exporting the controller functions
// module.exports = {
//     getAllBannerPhotos,
//     addBannerPhoto,
// };



const Banner = require('../Models/Banner'); // Adjust the import path based on your project structure


// Controller function to fetch all banner photos
const getAllBannerPhotos = async (req, res) => {
    try {
        const banners = await Banner.findAll({
            attributes: ['id', 'createdAt', 'photo'],
        });

        res.status(200).json(banners);
    } catch (error) {
        console.error('Error fetching all banner photos:', error);
        res.status(500).json({ error: 'An error occurred while fetching banner photos.' });
    }
};


const deleteBannerPhoto = async (req, res) => {
    try {
        const { id } = req.params; // Get the banner ID from the request parameters

        // Find the banner by its ID
        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ error: 'Banner not found.' });
        }

        // Delete the banner from the database
        await banner.destroy();

        res.status(200).json({ message: 'Banner photo deleted successfully from the database.' });
    } catch (error) {
        console.error('Error deleting banner photo from the database:', error);
        res.status(500).json({ error: 'An error occurred while deleting the banner photo from the database.', details: error.message });
    }
};




// const deleteBannerPhoto = async (req, res) => {
//     try {
//         const { id } = req.params; // Get the banner ID from the request parameters

//         // Find the banner by its ID
//         const banner = await Banner.findByPk(id);
//         if (!banner) {
//             return res.status(404).json({ error: 'Banner not found.' });
//         }

//         // Get the file path of the banner photo
//         const filePath = path.join('D:/bio-gas/FRONTEND__26092024/public', banner.photo);

//         // Delete the banner from the database
//         await banner.destroy();

//         // Optionally delete the file from the file system
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath); // Remove the photo file
//         }

//         res.status(200).json({ message: 'Banner photo deleted successfully.' });
//     } catch (error) {
//         console.error('Error deleting banner photo:', error);
//         res.status(500).json({ error: 'An error occurred while deleting the banner photo.', details: error.message });
//     }
// };


// Controller function to add a new banner photo
const addBannerPhoto = async (req, res) => {
    try {
        const { file } = req; // Access the uploaded file

        // Validate that a file is uploaded
        if (!file) {
            return res.status(400).json({ error: 'Photo is required.' });
        }

        // Save the file path to the database (relative to the public folder)
        const newBanner = await Banner.create({ photo: `/banner/${file.filename}` });

        res.status(201).json(newBanner);
    } catch (error) {
        console.error('Error adding banner photo:', error); // Log the complete error
        res.status(500).json({ error: 'An error occurred while adding the banner photo.', details: error.message });
    }
};

// Controller function to edit a banner photo
const editBannerPhoto = async (req, res) => {
    try {
        const { file } = req; // Access the uploaded file
        const { id } = req.params; // Get the banner ID from the request parameters

        // Validate that a file is uploaded
        if (!file) {
            return res.status(400).json({ error: 'New photo is required.' });
        }

        // Find the existing banner by its ID
        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ error: 'Banner not found.' });
        }

        // Update the banner's photo path
        banner.photo = `/banner/${file.filename}`;
        await banner.save(); // Save changes to the database

        res.status(200).json({ message: 'Banner photo updated successfully.', banner });
    } catch (error) {
        console.error('Error editing banner photo:', error); // Log the complete error
        res.status(500).json({ error: 'An error occurred while updating the banner photo.', details: error.message });
    }
};

// Exporting the controller functions
module.exports = {
    getAllBannerPhotos,
    addBannerPhoto,
    deleteBannerPhoto,
    editBannerPhoto, // New controller added here
};