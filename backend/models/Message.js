const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobseeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true, maxlength: 2000 },
        createdAt: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],
    unreadEmployer: { type: Number, default: 0 },
    unreadJobseeker: { type: Number, default: 0 },
  },
  { timestamps: true }
);

messageSchema.index({ job: 1, employer: 1, jobseeker: 1 }, { unique: true });

module.exports = mongoose.model('Message', messageSchema);