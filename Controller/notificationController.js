const Notification = require('../Models/notificationModel');


const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            order: [['createdAt', 'DESC']], 
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'An error occurred while fetching notifications.' });
    }
};


const createNotification = async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    try {
        const newNotification = await Notification.create({ title, description });
        res.status(201).json(newNotification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'An error occurred while creating the notification.' });
    }
};

module.exports = {
    getAllNotifications,
    createNotification,
};
