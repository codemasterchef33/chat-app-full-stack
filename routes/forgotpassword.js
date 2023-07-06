const express = require('express');
const router = express.Router();

const forgotPasswordController = require('../controllers/forgotpassword')


router.use('/forgotpassword', forgotPasswordController.forgotpassword)

router.get('/resetpassword/:id', forgotPasswordController.resetpassword)

router.get('/updatepassword/:resetpasswordid', forgotPasswordController.updatepassword)


module.exports = router;

