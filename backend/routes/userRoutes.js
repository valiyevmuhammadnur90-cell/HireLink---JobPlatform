const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadResume,
  toggleSavedJob,
  getSavedJobs,
} = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/resume', protect, upload.single('resume'), uploadResume);
router.get('/saved-jobs', protect, getSavedJobs);
router.put('/saved-jobs/:jobId', protect, toggleSavedJob);

module.exports = router;
