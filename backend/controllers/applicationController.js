const Application = require('../models/Application');
const Job = require('../models/Job');

const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Vakansiya topilmadi' });
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ message: 'Siz bu vakansiyaga allaqachon ariza topshirgansiz' });
    let resumePath = req.user.resume;
    if (req.file) resumePath = `/uploads/${req.file.filename}`;
    if (!resumePath) return res.status(400).json({ message: 'Iltimos, rezyume yuklang' });
    const application = await Application.create({ job: jobId, applicant: req.user._id, resume: resumePath, coverLetter: coverLetter || '' });
    job.applicationsCount += 1;
    await job.save();
    res.status(201).json(application);
  } catch (error) { next(error); }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({ path: 'job', populate: { path: 'postedBy', select: 'name company' } })
      .sort('-createdAt');
    res.json(applications);
  } catch (error) { next(error); }
};

const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Vakansiya topilmadi' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone skills')
      .sort('-createdAt');
    res.json(applications);
  } catch (error) { next(error); }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Noto\'g\'ri status' });
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Ariza topilmadi' });
    if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    application.status = status;
    await application.save();
    res.json(application);
  } catch (error) { next(error); }
};

module.exports = { applyToJob, getMyApplications, getJobApplications, updateApplicationStatus };