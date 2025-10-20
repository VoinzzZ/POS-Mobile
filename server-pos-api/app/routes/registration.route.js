const express = require('express');
const RegistrationController = require('../controllers/registration.controller');

const router = express.Router();

router.post('/tenant', RegistrationController.createTenant);

router.post('/verify-email', RegistrationController.sendEmailVerification);

router.post('/employee', RegistrationController.registerEmployeeWithPin);

router.post('/confirm-email', RegistrationController.confirmEmailVerification);

router.post('/complete', RegistrationController.completeRegistration);

module.exports = router;