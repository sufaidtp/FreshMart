const express = require("express")
const router = express.Router()
const userController = require("../controller/userController/userConroller")
const userRegistration = require("../controller/userController/userRegistration")


router.get("/", userController.home)
router.get("/home", userController.home)


router.get("/login", userController.login)
router.post("/login", userController.validateUser)

router.get("/googleSignIn", userController.google)
router.get("/auth/google/callback", userController.googleCallback);
router.get("/auth/failure", userController.authFailure);

router.get("/register", userRegistration.register)
router.post("/register", userRegistration.registerUser)
router.get("/otp_page", userRegistration.otpPage)
router.post("/otp_verification", userRegistration.otpVerification)


router.get("/user-reset-password", userController.reset_password)
router.post("/user-reset-password", userRegistration.resetotpv)

router.get("/reset_otp_verification", userRegistration.reset_otp_verification)
router.post("/reset_otp_verification", userRegistration.resetotpverification)

router.get("/reset-password", userRegistration.reset_password_get)
router.post("/reset-password", userRegistration.newPass)

// reset password/

router.post("/verifyOldpassword", userController.checkUser, userRegistration.verifyOldpassword)













// router to resend the otp when time experies
router.get('/resendotp', userRegistration.resendotp)

router.get("/signout", userController.signout)

























module.exports = router