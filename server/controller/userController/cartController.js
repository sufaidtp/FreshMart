const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const catDetails = require("../../model/categoryModel")
const wishDetails = require("../../model/wishlistModel")
const cartDetails = require("../../model/cartModel")
const sndmail = require("../userController/generateOtp")
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")
const sharp = require("sharp")
const session = require("express-session")
const addressPro = require("../../model/userAddressmodel")
const orderDetails = require("../../model/ordersModel")
const couponDetails = require("../../model/couponmodel")
require("dotenv").config()


const viewWish = async (req, res) => {
    try {
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        const wishData = await wishDetails.find({ username: req.session.userName })

        res.render("userWishlist", { userIn, Category, wishData })

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with viewwishlist post method" + e);
    }
}

const addWishlist = async (req, res) => {
    try {

        const wishPro = await productDetails.findOne({ _id: req.params.id })
        const wishDataFound = await wishDetails.findOne({ username: req.session.userName, product: wishPro.name })



        if (!wishDataFound) {
            const wishData = new wishDetails({
                username: req.session.userName,
                product: wishPro.name,
                image: wishPro.imagePath[0],
                price: wishPro.discountAmount
            })

            await wishData.save()

        }
        res.redirect("/wishlist")



    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with addWishlist" + e);
    }
}


const removeWishlist = async (req, res) => {
    try {
        proName = req.params.id
        await wishDetails.deleteOne({ product: proName })

        res.redirect("/wishlist")
    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with remove wishlist" + e);
    }
}
const viewDetails = async (req, res) => {
    try {
        console.log( req.params.id,"params");
        const product = await productDetails.findOne({ name: req.params.id })
        console.log(product,"product");
        res.redirect(`/productDetails/${product._id}`)
    } catch (e) {
        res.redirect("/errorPage")
    }
}

const userCart = async (req, res) => {
    try {
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        const cartData = await cartDetails.find({ username: req.session.userName }).sort({ "_id": -1 })

        res.render("usercart", { userIn, Category, cartData })

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with useCart" + e);
    }
}

const addtoCart = async (req, res) => {
    try {

        var msg
        if (req.session.userName) {



            const productData = await productDetails.findOne({ _id: req.body.id })
            const cartDataFound = await cartDetails.findOne({ username: req.session.userName, product: productData.name })
            const currentStock = productData.stock
            if (currentStock < 1 || cartDataFound && cartDataFound.quentity >= productData.stock) {
                msg = "Out Of Stock"
                res.setHeader('Content-Type', 'application/json'); // Set the content type header
                res.json({ success: true, message: msg });
                return

            }


            // console.log(cartDataFound, "===========");
            if (!cartDataFound) {
                const CartData = new cartDetails({
                    username: req.session.userName,
                    product: productData.name,
                    image: productData.imagePath[0],
                    price: productData.price,
                    quentity: 1,
                    offerPrice: productData.discountAmount,
                    offer: productData.offer

                })

                await CartData.save()

            } else {
                if (cartDataFound.quentity < 5) {
                    await cartDetails.updateOne(
                        { username: req.session.userName, product: productData.name },
                        { $inc: { quentity: 1 } }
                    )

                } else {
                    msg = 'limit exceed !'
                }

            }
            res.setHeader('Content-Type', 'application/json'); // Set the content type header
            res.json({ success: true, message: msg }); // Send JSON response with success flag

        } else {
            res.setHeader('Content-Type', 'application/json'); // Set the content type header
            res.json({ success: false }); // Send JSON response with success flag   
        }

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with addtoCart" + e);
    }
}

const deletecart = async (req, res) => {
    try {
        const proName = req.params.id
        console.log(proName);
        await cartDetails.deleteOne({ product: proName })
        res.redirect("/userCart")

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with deleteCart" + e);
    }
}


const about = async (req, res) => {
    try {
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        res.render("about", { userIn, Category })
    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with about page");
    }
}

const contact = async (req, res) => {
    try {
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        res.render("contact", { userIn, Category })
    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with about page");
    }
}

const updateQuantity = async (req, res) => {
    try {
        const productId = req.params.id;
        const newQuantity = req.body.quantity;


        // Update quantity using findByIdAndUpdate
        const updatedProduct = await cartDetails.updateOne({ username: req.session.userName, product: productId }, { quentity: newQuantity });

        if (!updatedProduct) {
            // If no product found with the given ID
            return res.status(404).send('Product not found');
        }

        // Send success response
        res.status(200).send('Quantity updated successfully');
    } catch (e) {
        res.redirect("/errorPage")
        // Handle error
        console.error('Error updating quantity:', e);

    }
}

const checkOut = async (req, res) => {
    try {
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        const address = await addressPro.find({ username: req.session.userName })

        // const coupon = await couponDetails.find({})
        // console.log(coupon + "coupon");


        const cartData = await cartDetails.find({ username: req.session.userName });

        let total = 0;
        for (let i = 0; i < cartData.length; i++) {
            let quantity = cartData[i].quentity;
            let price = cartData[i].offerPrice;
            total += quantity * price
        }
        req.session.totalOrderValue = total



        res.render("checkout", { userIn, Category, address, total, cartData })
    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with checkOut" + e);
    }
}

const displayAddress = async (req, res) => {
    try {

        const id = req.body.addressId

        const data = await addressPro.findOne({ _id: id })

        res.json({ data })
    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with display address" + e);
    }
}


const createAddress = async (req, res) => {
    try {
        const userin = req.session.userName;

        const newAddress = new addressPro({
            username: userin,
            fullname: req.body.fullname,
            phone: req.body.phone,
            address: {
                houseName: req.body.house,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                pincode: req.body.pincode,
            },
            primary: 0,
        });
        await newAddress.save();
        res.redirect("/checkOut")

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error with create address" + e);
    }
}






module.exports = {
    viewWish,
    addWishlist,
    removeWishlist,
    userCart,
    addtoCart,
    deletecart,
    about,
    contact,
    updateQuantity,
    checkOut,
    displayAddress,
    createAddress,
    viewDetails
}
