const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

router.post('/:jobId', protect, authorize('jobseeker'), upload.single('resume'), applyToJob);
router.get('/my', protect, authorize('jobseeker'), getMyApplications);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
