const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Barcha foydalanuvchilarni olish
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Foydalanuvchini bloklash/blokdan chiqarish
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: user.isActive ? 'Foydalanuvchi faollashtirildi' : 'Foydalanuvchi bloklandi', isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Foydalanuvchini o'chirish
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    await user.deleteOne();
    res.json({ message: 'Foydalanuvchi o\'chirildi' });
  } catch (error) {
    next(error);
  }
};

// @desc    Barcha vakansiyalarni olish (admin uchun, nofaol bo'lsa ham)
// @route   GET /api/admin/jobs
// @access  Private (admin)
const getAllJobsAdmin = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email').sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Vakansiyani faollashtirish/o'chirish (admin)
// @route   PUT /api/admin/jobs/:id/toggle-status
// @access  Private (admin)
const toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Vakansiya topilmadi' });
    job.isActive = !job.isActive;
    await job.save();
    res.json({ message: 'Holat yangilandi', isActive: job.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Umumiy statistika (dashboard uchun)
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStatistics = async (req, res, next) => {
  try {
    const [totalUsers, totalJobseekers, totalEmployers, totalJobs, activeJobs, totalApplications] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'jobseeker' }),
        User.countDocuments({ role: 'employer' }),
        Job.countDocuments(),
        Job.countDocuments({ isActive: true }),
        Application.countDocuments(),
      ]);

    // So'nggi 6 oy bo'yicha vakansiyalar dinamikasi
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const jobsPerMonth = await Job.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const topCategories = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalUsers,
      totalJobseekers,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      jobsPerMonth,
      applicationsByStatus,
      topCategories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllJobsAdmin,
  toggleJobStatus,
  getStatistics,
};
