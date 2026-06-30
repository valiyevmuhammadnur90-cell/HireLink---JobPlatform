const User = require("../models/User");

// @desc    O'z profilini ko'rish
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("savedJobs");
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Profilni yangilash
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    const fields = ["name", "phone", "location", "bio", "skills"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.body.company) {
      user.company = { ...user.company.toObject(), ...req.body.company };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      location: updated.location,
      bio: updated.bio,
      skills: updated.skills,
      company: updated.company,
      resume: updated.resume,
      avatar: updated.avatar,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rezyume (CV) yuklash
// @route   POST /api/users/resume
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Fayl yuklanmadi" });

    const user = await User.findById(req.user._id);
    user.resume = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Rezyume muvaffaqiyatli yuklandi",
      resume: user.resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vakansiyani saqlangan ro'yxatga qo'shish/olib tashlash
// @route   PUT /api/users/saved-jobs/:jobId
// @access  Private
const toggleSavedJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { jobId } = req.params;

    const index = user.savedJobs.findIndex((id) => id.toString() === jobId);
    let saved;
    if (index > -1) {
      user.savedJobs.splice(index, 1);
      saved = false;
    } else {
      user.savedJobs.push(jobId);
      saved = true;
    }
    await user.save();
    res.json({
      message: saved
        ? "Vakansiya saqlandi"
        : "Vakansiya saqlanganlardan olib tashlandi",
      saved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Saqlangan vakansiyalarni olish
// @route   GET /api/users/saved-jobs
// @access  Private
const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedJobs",
      populate: { path: "postedBy", select: "name company" },
    });
    res.json(user.savedJobs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  toggleSavedJob,
  getSavedJobs,
};
