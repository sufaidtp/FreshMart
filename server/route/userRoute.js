const express = require("express")
const router = express.Router()
const userController = require("../controller/userController/userConroller")
const userRegistration = require("../controller/userController/userRegistration")
const product = require("../controller/userController/userProduct")
const isUser = require("../middleware/userMiddleware")
const userData = require("../controller/userController/userProfilecontroller")
const cartController = require("../controller/userController/cartController")
const orderController = require("../controller/userController/orderController")
const { search } = require("./adminroute")
router.get("/", userController.home)
router.get("/home", userController.home)
router.get("/errorPage",userController.errorPage)

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


// product display
router.get("/productDetails/:id", product.productData)
router.get("/productCategory/:id", product.productCategory)



// user account all the details of the user
router.get("/userDetails/:id", isUser.isUser, userData.userAccount)
router.get("/userProfile/:id", isUser.isUser, userData.userProfile)
router.get("/userAdresslist/:id", isUser.isUser, userData.userAddresslist)
router.get("/addAddress", isUser.isUser, userData.addAddress)
router.post("/newAddress", isUser.isUser, userData.newAddress)
router.get("/editAddress", isUser.isUser, userData.editAddress)
router.post("/editAddress", isUser.isUser, userData.editAddresspost)
router.get("/deleteAddress", isUser.isUser, userData.deleteAddress)

router.get("/newPassword", isUser.isUser, userData.newPassword)
router.post("/updatePassword", isUser.isUser, userData.updatePassword)

// wishlistDetails
router.get("/wishlist", isUser.isUser, cartController.viewWish)
router.get("/wishlist/:id", isUser.isUser, cartController.addWishlist)
router.get("/delete_wishlist/:id", isUser.isUser, cartController.removeWishlist)

// cartDetails
router.get("/userCart", isUser.isUser, cartController.userCart)
router.post("/addtoCart", cartController.addtoCart)
router.get("/delete_cart/:id", isUser.isUser, cartController.deletecart)
router.post("/update_quantity/:id", isUser.isUser, cartController.updateQuantity)

router.get("/about", isUser.isUser, cartController.about)
router.get("/contact", isUser.isUser, cartController.contact)


router.get("/checkOut", isUser.isUser, cartController.checkOut)
router.post("/displayAddress", isUser.isUser, cartController.displayAddress)
router.post("/createAddress", isUser.isUser, cartController.createAddress)

//order management routers
router.get('/orderConfirmation', isUser.isUser, orderController.orderConfirmation)
router.get('/orderPlaced', isUser.isUser, orderController.orderPlaced)
router.get('/orders', isUser.isUser, orderController.orderHistory)
router.get("/invoice",isUser.isUser,orderController.invoice)
router.get('/orderDetail', isUser.isUser, orderController.orderDetail)
router.get("/orderCancel", isUser.isUser, orderController.cancelOrder)
router.post('/create_order', isUser.isUser, orderController.createOrder)
router.post('/payment_success', isUser.isUser, orderController.verifyPayment)
router.post("/applyCoupon", isUser.isUser, orderController.applyCoupon)
router.post("/removeCoupon", isUser.isUser, orderController.removeCoupon)


router.post('/updateOrderReason', isUser.isUser, orderController.orderReason)

// walllet
router.post("/walletpay",isUser.isUser,orderController.walletPay)
router.get("/wallet",isUser.isUser,orderController.walletView)

// search
router.post("/searchProduct",product.searchProduct)
router.get("/Ucategory/sort/:number",product.categoryProductSort)






module.exports = router