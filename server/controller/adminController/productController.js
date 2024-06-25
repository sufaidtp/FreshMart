const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const editCat = require("../../model/categoryModel")
const imageCon = require("../adminController/imageController")
const bcrypt = require("bcrypt")
const pathModule = require("path")
const sharp = require("sharp")
const categoryDetails = require("../../model/categoryModel")

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
        const { name, category, description, price, stock, about, offer } = req.body;

        // Find the ObjectId of the category
        const categoryObject = await categoryDetails.findOne({ name: category });
        if (!categoryObject) {
            console.log("Category not found");
            return res.redirect("/admin/products?product=Category not found");
        }


        const product = await productDetails.findOne({ name: name });
        let data = req.body
        let amount = price;
        if (data.offer == "") {
            const catdata = await categoryDetails.find({ name: category })
            if (catdata[0].offer == "") {
                amount = Number(data.discount)
            } else {
                let sum = Number(data.price) * Number(catdata[0].offer);
                let value = sum / 100;
                amount = Number(data.price) - value;
            }
        } else {
            const catdata = await categoryDetails.find({ name: category })
            if (catdata[0].offer > data.offer) {
                let sum = Number(data.price) * Number(catdata[0].offer)
                let value = sum / 100
                amount = Number(data.price) - value
            } else {
                amount = Number(data.discount)
            }
        }


        if (!product) {
            const productData = new productDetails({
                name: name,
                category: categoryObject._id, // Assign the ObjectId of the category
                description: description,
                about: about,
                price: price,
                offer: data.offer,
                stock: stock,
                imagePath: filepath,
                discountAmount: amount
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
        
        res.render("admin_add_products", { success, dataerror, cat })

    } catch (e) {
        console.log("error in the add_products of admin cnotroller :" + e)
    }
}

const editproduct = async (req, res) => {
    try {
        
        const productData = await productDetails.findOne({ _id: req.params.id })
        const categoryData = await categoryDetails.find({})
        
        res.render("admin_edit_product", { productData, categoryData })
    } catch (e) {
        console.log(e, 'error')
    }

}


const edit_product = async (req, res) => {

    try {
        
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
        const catdata = await categoryDetails.find({ _id: req.body.category })
        
        let offerPrice

        if (req.body.offer != "") {
            if (req.body.offer > catdata[0].offer) {
              let sum = Number(req.body.price) * Number(req.body.offer);
              let dis = sum / 100;
              offerPrice = Number(req.body.price) - Math.floor(dis);
              console.log(req.body.offer, "if");
            } else {
              let sum = Number(req.body.price) * Number(catdata[0].offer);
              let value = sum / 100;
              offerPrice = Number(req.body.price) - value;
            }
          } else {
            if (catdata[0].offer == "") {
              console.log("offer is null");
              offerPrice = Number(req.body.price);
            } else {
              console.log("offer is not null");
              let sum = Number(req.body.price) * Number(catdata[0].offer);
              let value = sum / 100;
              offerPrice = Number(req.body.price) - value;
              console.log(offerPrice, "offferprice - -- -- --");
            }
          }
          console.log(offerPrice,"offerprice");
          if (offerPrice > 0) {
            console.log(req.body,'req.body');
            if (req.body) {
              const success = await productDetails.updateOne({ _id: req.params.id },
                
                {
                  $set: {
                    name:req.body.name,
                    category:req.body.category,
                    description:req.body.description,
                    price:req.body.price,
                    stock:req.body.stock,
                    discountAmount:offerPrice,
                    offer:req.body.offer
                  },
                },
                {
                  upsert: true,
                }
              );
            
            }
          }
          console.log("PRODUCT UPDATED");
           res.redirect("/admin/products");

    } catch (e) {
        console.log("error with edit product admin", e);

    }
}


const searchProduct = async (req, res) => {
    try {
        const nameSearch = req.body.search
        const regex = new RegExp(`${nameSearch}`, "i")
        const products = await productDetails.find({ name: { $regex: regex } })
        res.render('admin_product', { products, nameSearch })
    } catch (e) {
        console.log("error with search product admin", e);
    }
}

const list_product = async (req, res) => {
    try {
       
        const productData = await productDetails.findOne({ _id: req.params.id })
        const data = await productDetails.updateOne({ _id: req.params.id }, { $set: { display: !productData.display } })
        res.redirect("/admin/products")

    } catch (e) {
        console.log("error with list product admin");
    }

}


const deleteImage = async (req, res) => {
    try {
        const productId = req.params.id; // Assuming id is passed in params
        const imageToDelete = req.query.delete;
        await productDetails.updateOne({ _id: productId }, { $pull: { imagePath: imageToDelete } })
        res.redirect(`/admin/edit_product/${productId}`)



    } catch (e) {
        console.log("error with delete image in admine side", e);
    }
}













module.exports = { productData, addProduct, add_products, editproduct, edit_product, searchProduct, list_product, deleteImage }