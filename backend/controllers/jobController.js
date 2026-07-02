const mongoose = require('mongoose');
const Job = require('../models/Job');

const getJobs = async (req, res, next) => {
  try {
    const { search, category, type, location, experienceLevel, salaryMin, salaryMax, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = { isActive: true };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (salaryMin || salaryMax) {
      query.salaryMax = { $gte: Number(salaryMin) || 0 };
      if (salaryMax) query.salaryMin = { $lte: Number(salaryMax) };
    }
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;
    const [jobs, total] = await Promise.all([
      Job.find(query).populate('postedBy', 'name company').sort(sort).skip(skip).limit(limitNum),
      Job.countDocuments(query),
    ]);
    res.json({ jobs, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) { next(error); }
};

const getJobById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Noto‘g‘ri ID' });
    }

    const job = await Job.findById(req.params.id).populate('postedBy', 'name company email');

    if (!job) {
      return res.status(404).json({ message: 'Vakansiya topilmadi' });
    }

    job.viewsCount += 1;
    await job.save();

    res.json(job);
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json(job);
  } catch (error) { next(error); }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Vakansiya topilmadi' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    Object.assign(job, req.body);
    const updated = await job.save();
    res.json(updated);
  } catch (error) { next(error); }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Vakansiya topilmadi' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    await job.deleteOne();
    res.json({ message: 'Vakansiya o\'chirildi' });
  } catch (error) { next(error); }
};

const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort('-createdAt');
    res.json(jobs);
  } catch (error) { next(error); }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };