const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const editCat = require("../../model/categoryModel")
const imageCon = require("../adminController/imageController")
const bcrypt = require("bcrypt")
const pathModule = require("path")
const sharp = require("sharp")
const categoryDetails=require("../../model/categoryModel")

const fs = require("fs")
const exp = require("constants")
const categoryModel = require("../../model/categoryModel")




const productData = async (req, res) => {
    try {
        const products = await productDetails.find({}).sort({ "_id": -1 }).populate("category") // Assuming "category" is the correct field name in your schema
        const cat = await editCat.find({})
        const product = req.query.product

        if (products.length > 0) {
            res.render("admin_product", { products, product, cat })
        } else {
            console.log("No products found");
            // Handle case where no products are found
            res.render("admin_product", { products: [], product, cat })
        }
    } catch (e) {
        console.log("Error in admin productData: " + e);
        res.status(500).send("Internal Server Error");
    }
}


const addProduct = async (req, res) => {
    try {
        const files = req.files;
        let filepath = files.map(file => file.path.replace(/\\/g, "/").replace("C:/Users/HP/Desktop/FreshMart project/", "").replace('public/uploads/', ""));
        const { name, category, description, price, stock, about } = req.body;

        // Find the ObjectId of the category
        const categoryObject = await categoryDetails.findOne({ name: category });
        if (!categoryObject) {
            console.log("Category not found");
            return res.redirect("/admin/products?product=Category not found");
        }

        const product = await productDetails.findOne({ name });

        if (!product) {
            const productData = new productDetails({
                name,
                category: categoryObject._id, // Assign the ObjectId of the category
                description,
                about,
                price,
                stock,
                imagePath: filepath,
            });

            await productData.save();
            console.log("Product saved successfully");
            return res.redirect("/admin/products?product=Product uploaded and processed successfully.");
        } else {
            console.log("Product already exists");
            return res.redirect("/admin/products?product=Product already exists!");
        }
    } catch (error) {
        console.log('Error in the productController addProduct admin side:', error);
        return res.redirect("/admin/products?product=Error uploading product. Please try again.");
    }
};



const add_products = async (req, res) => {

    try {
        const success = req.query.datasuccess
        const dataerror = req.query.dataerror
        const cat = await editCat.find({})
        console.log(cat)
        console.log('add_product router enterd')
        res.render("admin_add_products", { success, dataerror, cat })

    } catch (e) {
        console.log("error in the add_products of admin cnotroller :" + e)
    }
}

const editproduct = async (req, res) => {
    try {
        console.log(req.params.id)
        const productData = await productDetails.findOne({ _id: req.params.id })
        const categoryData=await categoryDetails.find({})
        console.log(productData)
        res.render("admin_edit_product", { productData,categoryData })
    } catch (e) {
        console.log(e, 'error')
    }

}


const edit_product = async (req, res) => {

    try {
        console.log(req.body)
        console.log('edit_product image check------------------')
        console.log(req.files)
        const files = req.files
        let imagePath = []
        // console.log('check for image is over+++++++++++')
        // console.log(file, 'file file file file file file')
        if (files.length != 0) {
            for (let i = 0; i < files.length; i++) {
                imagePath[i] = files[i].path.replace(/\\/g, "/").replace("C:/Users/HP/Desktop/FreshMart project/", "").replace('public/uploads/', "");
                console.log(imagePath);
                await productDetails.updateOne(
                    { _id: req.params.id },
                    { $set: { [`imagePath.${i}`]: imagePath[i] } }
                )
            }
        }
        if (req.body) {
            await productDetails.updateOne({ _id: req.params.id },
                {
                    $set: {
                        name: req.body.name,
                        category: req.body.category,
                        about: req.body.about,
                        price: req.body.price,
                        stock: req.body.stock,
                        // discountAmount: req.body.offerPrice,
                        // offer:req.body.offer,


                    }
                },
                {
                    upsert: true
                })
            res.redirect("/admin/products")
        } else {
            console.log('data not retrived from edit_product route ')

        }

    } catch (e) {
        console.log("error with edit product admin", e);

    }
}


const searchProduct = async (req, res) => {
    try {
        const nameSearch = req.body.search
        console.log(nameSearch);
        const regex = new RegExp(`${nameSearch}`, "i")
        console.log(regex);
        const products = await productDetails.find({ name: { $regex: regex } })
        console.log(products)
        res.render('admin_product', { products, nameSearch })
    } catch (e) {
        console.log("error with search product admin", e);
    }
}

const list_product = async (req, res) => {
    try {
        console.log("hhhh");
        console.log(req.params.id)
        const productData = await productDetails.findOne({ _id: req.params.id })
        console.log(productData);
        const data = await productDetails.updateOne({ _id: req.params.id }, { $set: { display: !productData.display } })
        console.log(data)
        res.redirect("/admin/products")

    } catch (e) {
        console.log("error with list product admin");
    }

}

















module.exports = { productData, addProduct, add_products, editproduct, edit_product, searchProduct, list_product }