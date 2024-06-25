const express = require("express")
const router = express.Router()
const adminController = require("../controller/adminController/adminController")
const adminCheck = require("../middleware/adminMiddleware")
const productController = require("../controller/adminController/productController")
const adminCategory = require("../controller/adminController/categoryController")
const imageUpload = require("../controller/adminController/imageController")
const orderController = require("../controller/adminController/orderController")


router.get("/", adminController.admin)
router.post("/", adminController.adminDashboard)
router.get("/dashboard", adminCheck.isAdmin, adminController.toDashboard)
router.get("/chart-data", adminCheck.isAdmin, adminController.chartData)
router.get("/chart-data-month", adminCheck.isAdmin, adminController.chartDataMonth)
router.get('/chart-data-year', adminCheck.isAdmin, adminController.chartDataYear)
router.post("/salesReport", adminCheck.isAdmin, orderController.salesReport)
router.get("/logout", adminController.logout)


// userDetails display

router.get("/userDetails", adminCheck.isAdmin, adminController.user)
router.post("/userDetails", adminCheck.isAdmin, adminController.searchUser)
router.get("/block/:username", adminCheck.isAdmin, adminController.block)




// list the category of product

router.get("/category", adminCheck.isAdmin, adminCategory.listCategory)
router.post("/category", adminCheck.isAdmin, adminCategory.save_category)
router.post("/editcat/:id", adminCheck.isAdmin, adminCategory.edit_category)
router.get("/list/:id", adminCheck.isAdmin, adminController.list)


// list the product

router.get("/products", adminCheck.isAdmin, productController.productData)
router.post("/products", adminCheck.isAdmin, imageUpload.array('images', 5), productController.addProduct)
router.get("/add_products", adminCheck.isAdmin, productController.add_products)
router.get("/edit_product/:id", adminCheck.isAdmin, productController.editproduct)
router.post("/edit_product/:id", adminCheck.isAdmin, imageUpload.array('images', 5), productController.edit_product)
router.post("/searchProduct", adminCheck.isAdmin, productController.searchProduct)
router.get('/delete/:id', adminCheck.isAdmin, productController.list_product)
router.get("/ImageDelete/:id", adminCheck.isAdmin, productController.deleteImage)

//order controll

router.get("/orderHistory", adminCheck.isAdmin, orderController.orderHistory)
router.get('/orderDetails', adminCheck.isAdmin, orderController.order_Detail)
router.post('/changeStatus', adminCheck.isAdmin, orderController.changeStatus)

// coupon controll

router.get("/coupon", adminCheck.isAdmin, orderController.coupon)
router.post("/addCoupon", adminCheck.isAdmin, orderController.addCoupon)
router.get("/removeCoupon", adminCheck.isAdmin, orderController.removeCoupon)
router.post("/editCoupon", adminCheck.isAdmin, orderController.editCoupon)

router.get("/returnView", adminCheck.isAdmin, orderController.returnView)
router.post('/handleReturnRequest', adminCheck.isAdmin, orderController.handleReturnRequest)







module.exports = router