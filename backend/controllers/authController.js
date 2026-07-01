const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Barcha maydonlarni to\'ldiring' });
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Bu email bilan foydalanuvchi mavjud' });
    const user = await User.create({ name, email, password, role: ['jobseeker', 'employer'].includes(role) ? role : 'jobseeker' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) { next(error); }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email va parolni kiriting' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });
    if (!user.isActive) return res.status(403).json({ message: 'Hisobingiz bloklangan' });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) { next(error); }
};

module.exports = { registerUser, loginUser };