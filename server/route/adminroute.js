const express = require("express")
const router = express.Router()
const adminController = require("../controller/adminController/adminController")
const adminCheck = require("../middleware/adminMiddleware")
const productController = require("../controller/adminController/productController")
const adminCategory = require("../controller/adminController/categoryController")
const imageUpload = require("../controller/adminController/imageController")


router.get("/", adminController.admin)
router.post("/", adminController.adminDashboard)
router.get("/dashboard", adminCheck.isAdmin, adminController.toDashboard)
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
router.post("/products", adminCheck.isAdmin ,imageUpload.array('images',5),productController.addProduct)
router.get("/add_products", adminCheck.isAdmin, productController.add_products)
router.get("/edit_product/:id", adminCheck.isAdmin, productController.editproduct)
router.post("/edit_product/:id",adminCheck.isAdmin,imageUpload.array('images',5),productController.edit_product)
router.post("/searchProduct", adminCheck.isAdmin, productController.searchProduct)
router.get('/delete/:id', adminCheck.isAdmin, productController.list_product)











module.exports = router