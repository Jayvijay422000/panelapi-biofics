const jwt = require('jsonwebtoken');
const User = require('../Models/user');

const authenticateUser = async (req, res, next) => {
  try {
    let token;
    if (req.headers?.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token: userId not found' });
    }

    const user = await User.findByPk(decoded.userId); // Use findByPk for Sequelize models

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const checkUserRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await User.findByPk(req.user.id); // Use findByPk for Sequelize models

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = { authenticateUser, checkUserRole };

