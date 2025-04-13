const User = require('../Models/user');

const checkSubscription = async (req, res, next) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user from authentication middleware
    const user = await User.findByPk(userId);

    if (user && user.subscription_status === 'active' 
        // && new Date() <= new Date(user.subscription_end)
    )
         {
        next();
    } else {
        res.status(403).json({ message: 'Your subscription is inactive or has expired. Please contact admin.' });
    }
};

module.exports = checkSubscription;
