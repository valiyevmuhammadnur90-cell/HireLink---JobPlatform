const Message = require('../models/Message');
const Job = require('../models/Job');

const getOrCreateConversation = async (jobId, employerId, jobseekerId) => {
  let conv = await Message.findOne({ job: jobId, employer: employerId, jobseeker: jobseekerId });
  if (!conv) conv = await Message.create({ job: jobId, employer: employerId, jobseeker: jobseekerId, messages: [] });
  return conv;
};

const getConversation = async (req, res, next) => {
  try {
    const { jobId, userId } = req.params;
    const me = req.user;
    const job = await Job.findById(jobId).populate('postedBy', 'name');
    if (!job) return res.status(404).json({ message: 'Vakansiya topilmadi' });
    let employerId, jobseekerId;
    if (me.role === 'employer' || me.role === 'admin') { employerId = job.postedBy._id; jobseekerId = userId; }
    else { employerId = job.postedBy._id; jobseekerId = me._id; }
    const conv = await getOrCreateConversation(jobId, employerId, jobseekerId);
    if (me.role === 'employer' || me.role === 'admin') conv.unreadEmployer = 0;
    else conv.unreadJobseeker = 0;
    conv.messages.forEach((m) => { if (m.sender.toString() !== me._id.toString()) m.read = true; });
    await conv.save();
    const populated = await Message.findById(conv._id)
      .populate('job', 'title company')
      .populate('employer', 'name email')
      .populate('jobseeker', 'name email')
      .populate('messages.sender', 'name');
    res.json(populated);
  } catch (error) { next(error); }
};

const sendMessage = async (req, res, next) => {
  try {
    const { jobId, userId } = req.params;
    const { text } = req.body;
    const me = req.user;
    if (!text?.trim()) return res.status(400).json({ message: 'Xabar bo\'sh bo\'lishi mumkin emas' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Vakansiya topilmadi' });
    let employerId, jobseekerId;
    if (me.role === 'employer' || me.role === 'admin') { employerId = job.postedBy; jobseekerId = userId; }
    else { employerId = job.postedBy; jobseekerId = me._id; }
    const conv = await getOrCreateConversation(jobId, employerId, jobseekerId);
    const newMsg = { sender: me._id, text: text.trim(), createdAt: new Date(), read: false };
    conv.messages.push(newMsg);
    if (me.role === 'employer' || me.role === 'admin') conv.unreadJobseeker += 1;
    else conv.unreadEmployer += 1;
    await conv.save();
    const updated = await Message.findById(conv._id).populate('messages.sender', 'name');
    res.status(201).json(updated.messages[updated.messages.length - 1]);
  } catch (error) { next(error); }
};

const getMyConversations = async (req, res, next) => {
  try {
    const me = req.user;
    const query = me.role === 'jobseeker' ? { jobseeker: me._id } : me.role === 'employer' ? { employer: me._id } : { $or: [{ employer: me._id }, { jobseeker: me._id }] };
    const convs = await Message.find(query)
      .populate('job', 'title company')
      .populate('employer', 'name')
      .populate('jobseeker', 'name')
      .sort('-updatedAt');
    const result = convs.map((c) => ({
      _id: c._id, job: c.job, employer: c.employer, jobseeker: c.jobseeker,
      lastMessage: c.messages[c.messages.length - 1] || null,
      unread: me.role === 'employer' ? c.unreadEmployer : c.unreadJobseeker,
      updatedAt: c.updatedAt,
    }));
    res.json(result);
  } catch (error) { next(error); }
};

const pollMessages = async (req, res, next) => {
  try {
    const { jobId, userId } = req.params;
    const { after } = req.query;
    const me = req.user;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Topilmadi' });
    let employerId, jobseekerId;
    if (me.role === 'employer' || me.role === 'admin') { employerId = job.postedBy; jobseekerId = userId; }
    else { employerId = job.postedBy; jobseekerId = me._id; }
    const conv = await Message.findOne({ job: jobId, employer: employerId, jobseeker: jobseekerId })
      .populate('messages.sender', 'name');
    if (!conv) return res.json([]);
    const afterDate = after ? new Date(Number(after)) : new Date(0);
    res.json(conv.messages.filter((m) => new Date(m.createdAt) > afterDate));
  } catch (error) { next(error); }
};

module.exports = { getConversation, sendMessage, getMyConversations, pollMessages };