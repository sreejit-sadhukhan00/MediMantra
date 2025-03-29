import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { 
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  updateAvailability,
  uploadVerificationDocuments,
  getDoctorAppointments,
  getDoctorPatients,
  getDoctorReviews,
  addEducation,
  removeEducation,
  updateProfileImage,
  getDoctorDashboardStats,
  getDoctorProfile,
  verifyDoctor,
  rejectDoctor,
  searchDoctors,
  filterDoctorsBySpecialty,
  toggleDoctorAvailability,
  deleteDoctor
} from '../controllers/doctor.controller.js';

const router = express.Router();

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors (with pagination)
 * @access  Public
 */
router.get('/', getDoctors);

/**
 * @route   GET /api/doctors/search
 * @desc    Search doctors by name or specialty
 * @access  Public
 */
router.get('/search', searchDoctors);

/**
 * @route   GET /api/doctors/specialty/:specialty
 * @desc    Filter doctors by specialty
 * @access  Public
 */
router.get('/specialty/:specialty', filterDoctorsBySpecialty);

/**
 * @route   GET /api/doctors/profile
 * @desc    Get current doctor's profile
 * @access  Private (Doctor only)
 */
router.get('/profile', authMiddleware, getDoctorProfile);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 * @access  Public
 */
router.get('/:id', getDoctorById);

/**
 * @route   PUT /api/doctors/profile
 * @desc    Update doctor's profile
 * @access  Private (Doctor only)
 */
router.put('/profile', authMiddleware, updateDoctorProfile);

/**
 * @route   PUT /api/doctors/availability
 * @desc    Update doctor's availability
 * @access  Private (Doctor only)
 */
router.put('/availability', authMiddleware, updateAvailability);

/**
 * @route   POST /api/doctors/verification-documents
 * @desc    Upload verification documents
 * @access  Private (Doctor only)
 */
router.post('/verification-documents', authMiddleware, uploadVerificationDocuments);

/**
 * @route   GET /api/doctors/appointments
 * @desc    Get doctor's appointments
 * @access  Private (Doctor only)
 */
router.get('/appointments', authMiddleware, getDoctorAppointments);

/**
 * @route   GET /api/doctors/patients
 * @desc    Get doctor's patients
 * @access  Private (Doctor only)
 */
router.get('/patients', authMiddleware, getDoctorPatients);

/**
 * @route   GET /api/doctors/reviews
 * @desc    Get doctor's reviews
 * @access  Private (Doctor only)
 */
router.get('/reviews', authMiddleware, getDoctorReviews);

/**
 * @route   POST /api/doctors/education
 * @desc    Add education to doctor's profile
 * @access  Private (Doctor only)
 */
router.post('/education', authMiddleware, addEducation);

/**
 * @route   DELETE /api/doctors/education/:eduId
 * @desc    Remove education from doctor's profile
 * @access  Private (Doctor only)
 */
router.delete('/education/:eduId', authMiddleware, removeEducation);

/**
 * @route   PUT /api/doctors/profile-image
 * @desc    Update doctor's profile image
 * @access  Private (Doctor only)
 */
router.put('/profile-image', authMiddleware, updateProfileImage);

/**
 * @route   GET /api/doctors/dashboard-stats
 * @desc    Get doctor's dashboard statistics
 * @access  Private (Doctor only)
 */
router.get('/dashboard-stats', authMiddleware, getDoctorDashboardStats);

/**
 * @route   PUT /api/doctors/:id/verify
 * @desc    Verify a doctor (Admin only)
 * @access  Private (Admin only)
 */
router.put('/:id/verify', authMiddleware, verifyDoctor);

/**
 * @route   PUT /api/doctors/:id/reject
 * @desc    Reject a doctor (Admin only)
 * @access  Private (Admin only)
 */
router.put('/:id/reject', authMiddleware, rejectDoctor);

/**
 * @route   PUT /api/doctors/toggle-availability
 * @desc    Toggle doctor's availability status
 * @access  Private (Doctor only)
 */
router.put('/toggle-availability', authMiddleware, toggleDoctorAvailability);

/**
 * @route   DELETE /api/doctors
 * @desc    Delete doctor's account
 * @access  Private (Doctor only)
 */
router.delete('/', authMiddleware, deleteDoctor);

export default router;