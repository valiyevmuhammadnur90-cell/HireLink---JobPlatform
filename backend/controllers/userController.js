const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');
    res.json(user);
  } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    ['name', 'phone', 'location', 'bio', 'skills'].forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    if (req.body.company) user.company = { ...user.company.toObject(), ...req.body.company };
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, phone: updated.phone, location: updated.location, bio: updated.bio, skills: updated.skills, company: updated.company, resume: updated.resume, avatar: updated.avatar });
  } catch (error) { next(error); }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Fayl yuklanmadi' });
    const user = await User.findById(req.user._id);
    user.resume = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: 'Rezyume muvaffaqiyatli yuklandi', resume: user.resume });
  } catch (error) { next(error); }
};

const toggleSavedJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { jobId } = req.params;
    const index = user.savedJobs.findIndex((id) => id.toString() === jobId);
    let saved;
    if (index > -1) { user.savedJobs.splice(index, 1); saved = false; }
    else { user.savedJobs.push(jobId); saved = true; }
    await user.save();
    res.json({ message: saved ? 'Vakansiya saqlandi' : 'Olib tashlandi', saved });
  } catch (error) { next(error); }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'savedJobs', populate: { path: 'postedBy', select: 'name company' } });
    res.json(user.savedJobs);
  } catch (error) { next(error); }
};

module.exports = { getProfile, updateProfile, uploadResume, toggleSavedJob, getSavedJobs };