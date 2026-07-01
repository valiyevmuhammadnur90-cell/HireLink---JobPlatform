const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
      if (!req.user.isActive) return res.status(403).json({ message: 'Hisobingiz bloklangan' });
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token yaroqsiz yoki muddati o\'tgan' });
    }
  }
  return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu amalni bajarish uchun ruxsatingiz yo\'q' });
    }
    next();
  };
};

module.exports = { protect, authorize };