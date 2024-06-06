
const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const catDetails = require("../../model/categoryModel")
const sndmail = require("../userController/generateOtp")
const bcrypt = require("bcrypt")
const sharp = require("sharp")
const session = require("express-session")
const addressPro = require("../../model/userAddressmodel")
require("dotenv").config()



const userAccount = async (req, res) => {

    try {
        console.log(req.params.id);
        const user = await userDetails.findOne({ username: req.params.id });
        const userIn = req.session.userName;
        const Category = await catDetails.find({ list: 0 })
        const reset = req.params.id
        console.log(user);
        res.render("userAccount", { user, userIn, Category, reset })


    } catch (e) {
        console.log("error with user side userAccount" + e);
    }
}

const userProfile = async (req, res) => {
    try {
        console.log(req.params.id);
        const user = await userDetails.findOne({ username: req.params.id });
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })

        res.render("userProfile", { userIn, user, Category })

    } catch (e) {
        console.log("error with userside userProfile" + e);
    }
}

const userAddresslist = async (req, res) => {
    try {
        const user = await userDetails.findOne({ username: req.params.id });
        const userAddress = await addressPro.find({ username: req.session.userName })
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        const suc = req.query.success
        
        const del = req.query.del
        res.render("userAddresslist", { user, userIn, Category, userAddress, suc, del })

    } catch (e) {
        console.log("error with userAddress get method");
    }
}


const addAddress = async (req, res) => {
    try {
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        res.render("userAddress", { userIn, Category })

    } catch (e) {
        console.log("error with newAddress get method");
    }
}

const newAddress = async (req, res) => {
    try {


        console.log(req.body, '././././././././')

        const userin = req.session.userName;
        console.log(userin);
        console.log(req.body);
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
        res.redirect(`/userAdresslist/${userin}`);

    } catch (e) {
        console.log("error with newAddress post method" + e);
    }
}

const editAddress = async (req, res) => {
    try {
        const address = await addressPro.findOne({ _id: req.query.id })
        console.log(address);
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })


        res.render("userAddress", { userIn, Category, address })


    } catch (e) {
        console.log("error with edit address get method" + e);
    }
}

const editAddresspost = async (req, res) => {
    try {
        console.log(req.query.id, "=========");


        await addressPro.updateOne({ _id: req.query.id },
            {
                $set: {
                    fullname: req.body.fullname,
                    phone: req.body.phone,
                    address: {
                        houseName: req.body.house,
                        city: req.body.city,
                        state: req.body.state,
                        country: req.body.country,
                        pincode: req.body.pincode,
                    },
                }

            }
        )
        console.log(req.query, "zzzzzzzzz");
        res.redirect(`/userAdresslist/${req.query.id}?success=Address updated successfully`)


    } catch (e) {
        console.log("error with edit address post method" + e);
    }
}

const deleteAddress = async (req, res) => {
    try {
        console.log(req.query.id);
        await addressPro.deleteOne({ _id: req.query.id })
        console.log("address deleted");
        res.redirect("/userAdresslist/''?del=address deleted")

    } catch (e) {
        console.log("error with address delete get method" + e);
    }
}

const newPassword = async (req, res) => {
    console.log("0000000");
    try {

        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        const msg1 = req.query.msg1
        const msg2= req.query.msg2
        const msg3= req.query.msg3


        res.render("updatePassword", { userIn, Category, msg1,msg2,msg3})
    } catch (e) {
        console.log("error with newPassword  get method" + e);
    }
}

const updatePassword = async (req, res) => {
    try {
        const { password, npass, cpass } = req.body
        console.log(">>>>>" + `pass${password},npass${npass},cpass${cpass}`);
        const userIn = req.session.userName
        console.log(userIn);
        const user = await userDetails.findOne({ username: userIn })
        console.log(user + "<<<");
        const isPassword = await bcrypt.compare(npass, user.password)
        if (isPassword) {
            res.redirect("/newPassword?msg1=Enter Diffrent Password")
        } if (npass !== cpass) {
            res.redirect("/newPassword?msg2=password does not match")

        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (passwordMatch) {
            const hashedPassword = await bcrypt.hash(npass, 10)
            newUser = await userDetails.updateOne({ username: userIn }, { password: hashedPassword })
            console.log(newUser + "password updated");
            res.redirect("/userDetails/password reset")
        } else {
            res.redirect("/newPassword?msg3=Invalid Password")

        }


    } catch (e) {
        console.log("error with updatePassword  post method" + e);
    }
}


module.exports = { userAccount, userProfile, userAddresslist, addAddress, newAddress, editAddress, editAddresspost, deleteAddress, newPassword, updatePassword }