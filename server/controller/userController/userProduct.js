const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const catDetails = require("../../model/categoryModel")
const bcrypt = require("bcrypt")
const sharp = require("sharp")
require("dotenv").config();


const productData = async (req, res) => {
    try {

        const details = await productDetails.findOne({ _id: req.params.id })
        console.log(details);
        const relatedProduct = await productDetails.find({ $and: [{ category: details.category }, { display: true }, { _id: { $ne: req.params.id } }] }).limit(4)
        console.log(relatedProduct + "nnnn");
        const Category = await catDetails.find({ list: 0 })
        userIn = req.session.userName



        if (details) {
            const { _id,name, description, category, price, imagePath, stock, about, offer, discountAmount } = details
            console.log(imagePath);
            res.render("productDetails", { _id,name, description, category, price, imagePath, stock, about, offer, discountAmount, relatedProduct, Category, userIn })
        } else {
            console.log("userController - productData can't read data from db")

        }

    } catch (e) {
        console.log("error with userside product details" + e);
    }
}


const productCategory = async (req, res) => {
    try {

        const product = await productDetails.find({ category: req.params.id ,display:true})
        const catName = await catDetails.find({ _id: req.params.id });
        const Category = await catDetails.find({ list: 0 })
        const userIn = req.session.userName;
        req.session.catId=req.params.id
        console.log(product);
        console.log(catName[0].name);
        res.render("productCategory", { product, catName, Category, userIn });



    } catch (e) {
        console.log("error with userside product category" + e);
    }
}

const searchProduct=async(req,res)=>{
    try{
        const catName = await catDetails.find({ _id: req.session.catId });
        const Category = await catDetails.find({ list: 0 })
        const productSearch=req.body.productSearch
        console.log(productSearch);
        const regex = new RegExp(`${productSearch}`, "i")
        console.log(regex);
        const product = await productDetails.find({ category:req.session.catId,name: { $regex: regex } })
        console.log(product)
        res.render("productCategory",{product,catName,Category})





    }catch(e){
        console.log("error with product search"+e);
    }
}





module.exports = { productData, productCategory ,searchProduct}