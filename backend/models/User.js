const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ism kiritilishi shart'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email kiritilishi shart'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email formati noto\'g\'ri'],
    },
    password: {
      type: String,
      required: [true, 'Parol kiritilishi shart'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['jobseeker', 'employer', 'admin'],
      default: 'jobseeker',
    },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    avatar: { type: String, default: '' },
    resume: { type: String, default: '' }, // CV fayl yo'li
    company: {
      name: { type: String, default: '' },
      website: { type: String, default: '' },
      logo: { type: String, default: '' },
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Parolni saqlashdan oldin hash qilish
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Parolni solishtirish metodi
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
