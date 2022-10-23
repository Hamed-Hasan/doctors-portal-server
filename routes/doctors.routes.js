const express = require('express');
const doctorsController = require('../controller/controller.doctors');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');

const router = express.Router();

router.get('/service', doctorsController.getAllService)
router.get('/showReview', doctorsController.getAllReviews)
router.get('/user',verifyJWT, doctorsController.getAllUser)
router.get('/admin/:email', doctorsController.getCheckAdmin)
router.get('/available', doctorsController.getAvailableAllAppointments)


module.exports = router;