const express = require('express');
const doctorsController = require('../controller/controller.doctors');
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyAdmin');

const router = express.Router();

router.get('/service', doctorsController.getAllService)


module.exports = router;