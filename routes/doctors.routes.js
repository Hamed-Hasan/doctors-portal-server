const express = require("express");
const doctorsController = require("../controller/controller.doctors");
const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// GET METHODS
router.get("/service", doctorsController.getAllService);
router.get("/showReview", doctorsController.getAllReviews);
router.get("/user", verifyJWT, doctorsController.getAllUser);
router.get("/admin/:email", doctorsController.getCheckAdmin);
router.get("/available", doctorsController.getAvailableAllAppointments);
router.get("/booking", verifyJWT, doctorsController.getVerifyBooking);
router.get("/booking/:id", verifyJWT, doctorsController.getIdByBooking);
router.get("/doctors", verifyJWT, verifyAdmin, doctorsController.getAllDoctors);

// POST METHODS
router.post("/create-payment-intent", verifyJWT, doctorsController.createPaymentIntent)
router.post("/addReview", doctorsController.createReview)
router.post("/booking", doctorsController.createBooking)
router.post("/doctors",verifyJWT,verifyAdmin, doctorsController.createDoctor)

// PATCH METHODS
router.patch("/booking/:id", verifyJWT , doctorsController.updatePaymentByMail)

// PUT METHODS
router.put("/user/admin/:email", verifyJWT, doctorsController.updateCreateAdmin)
router.put("/user/:email", doctorsController.updateUserEmail)

// DELETE METHODS
router.delete("/doctor/:email", verifyJWT, verifyAdmin ,  doctorsController.deleteDoctorByMail)
router.delete("/user/:email", verifyJWT, verifyAdmin ,  doctorsController.deleteUserByMail)

module.exports = router;
