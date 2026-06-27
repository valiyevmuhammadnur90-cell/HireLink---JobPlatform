const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Vakansiya nomi kiritilishi shart"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Tavsif kiritilishi shart"],
    },
    company: {
      type: String,
      required: [true, "Kompaniya nomi kiritilishi shart"],
    },
    location: {
      type: String,
      required: [true, "Manzil kiritilishi shart"],
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      default: "full-time",
    },
    category: {
      type: String,
      default: "general",
    },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    experienceLevel: {
      type: String,
      enum: ["junior", "middle", "senior", "lead", "any"],
      default: "any",
    },
  contactPhone: String,
    skills: [{ type: String }],
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Qidiruv tezligi uchun matn indeksi
jobSchema.index({
  title: "text",
  description: "text",
  company: "text",
  skills: "text",
});

module.exports = mongoose.model("Job", jobSchema);
