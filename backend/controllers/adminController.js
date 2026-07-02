const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const getAllUsers = async (req, res, next) => {
  try { res.json(await User.find().select('-password').sort('-createdAt')); }
  catch (e) { next(e); }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Topilmadi' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (e) { next(e); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Topilmadi' });
    await user.deleteOne();
    res.json({ message: 'O\'chirildi' });
  } catch (e) { next(e); }
};

const getAllJobsAdmin = async (req, res, next) => {
  try { res.json(await Job.find().populate('postedBy', 'name email').sort('-createdAt')); }
  catch (e) { next(e); }
};

const toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Topilmadi' });
    job.isActive = !job.isActive;
    await job.save();
    res.json({ isActive: job.isActive });
  } catch (e) { next(e); }
};

const getStatistics = async (req, res, next) => {
  try {
    const [totalUsers, totalJobseekers, totalEmployers, totalJobs, activeJobs, totalApplications] = await Promise.all([
      User.countDocuments(), User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' }), Job.countDocuments(),
      Job.countDocuments({ isActive: true }), Application.countDocuments(),
    ]);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const jobsPerMonth = await Job.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const applicationsByStatus = await Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const topCategories = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 },
    ]);
    res.json({ totalUsers, totalJobseekers, totalEmployers, totalJobs, activeJobs, totalApplications, jobsPerMonth, applicationsByStatus, topCategories });
  } catch (e) { next(e); }
};

module.exports = { getAllUsers, toggleUserStatus, deleteUser, getAllJobsAdmin, toggleJobStatus, getStatistics };