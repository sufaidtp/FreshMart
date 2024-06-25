const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const catDetails = require("../../model/categoryModel")
const bcrypt = require("bcrypt")
const cartDetails=require("../../model/cartModel")
const sharp = require("sharp")
require("dotenv").config();


const productData = async (req, res) => {
    try {

        const details = await productDetails.findOne({ _id: req.params.id })
        const relatedProduct = await productDetails.find({ $and: [{ category: details.category }, { display: true }, { _id: { $ne: req.params.id } }] }).limit(4)
        const Category = await catDetails.find({ list: 0 })
        userIn = req.session.userName
        const cartData = await cartDetails.find({ username: req.session.userName })
        const cartCount = cartData.length;



        if (details) {
            const { _id, name, description, category, price, imagePath, stock, about, offer, discountAmount } = details
            console.log(imagePath);
            res.render("productDetails", { _id, name, description, category, price, imagePath, stock, about, offer, discountAmount, relatedProduct, Category, userIn ,cartCount,cartData})
        } else {
            console.log("userController - productData can't read data from db")

        }

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with userside product details" + e);
    }
}


const productCategory = async (req, res) => {
    try {
        console.log(req.params,"req.params");

        const product = await productDetails.find({ category: req.params.id, display: true })
        const cartData = await cartDetails.find({ username: req.session.userName })
        const cartCount = cartData.length;
        const catName = await catDetails.find({ _id: req.params.id });
        const Category = await catDetails.find({ list: 0 })
        const userIn = req.session.userName;
        req.session.catId = req.params.id
        console.log(catName[0].name);
        res.render("productCategory", { product, catName, Category, userIn ,cartCount,cartData});



    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with userside product category" + e);
    }
}

const searchProduct = async (req, res) => {
    try {
        const catName = await catDetails.find({ _id: req.session.catId });
        const Category = await catDetails.find({ list: 0 })
        const userIn = req.session.userName;
        const productSearch = req.body.productSearch
        const regex = new RegExp(`${productSearch}`, "i")
        const product = await productDetails.find({ category: req.session.catId, name: { $regex: regex } })
        res.render("productCategory", { product, catName, Category, userIn })





    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with product search" + e);
    }
}

const categoryProductSort = async (req, res) => {
    try {
        const catName = await catDetails.find({ _id: req.session.catId });
        const Category = await catDetails.find({ list: 0 })
        const userIn = req.session.userName;
        const number = req.params.number
        const cat = req.session.catId
        if (number == 1) {
            console.log(number);
            
            const product = await productDetails.find({ category: cat }).sort({ name: 1 })
            console.log("DATA IF 1 is pressed:" + product);
            const value = "A - Z";
            res.render("productCategory", { userIn, Category, product, catName })

        } else if (number == 2) {

            const product = await productDetails.find({ category: cat }).sort({ name: -1 });
            console.log("DATA IF 2 is pressed:" + product);
            res.render("productCategory", {
                userIn,
                product,
                Category,
                catName
            });
        } else if (number == 3) {

            const product = await productDetails.find({category: cat}).sort({ price: 1 });
            console.log("DATA IF 3 is pressed:" + product);
            res.render("ProductCategory", {
                userIn,
                product,
                Category,
                catName
                
            });
        } else if (number == 4) {
            const product = await productDetails.find({category: cat}).sort({ price: -1 });
            console.log("DATA IF 4 is pressed:" + product);
            res.render("ProductCategory", {
                userIn,
                product,
                Category,
                catName
            });
        }
    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with categoryproduct" + e);
    }
}





module.exports = { productData, productCategory, searchProduct, categoryProductSort }