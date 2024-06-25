const userDetails = require("../../model/userModel")
const session = require("express-session")
const bcrypt = require('bcrypt')
const sndmail = require("../userController/generateOtp")
const catDetails = require("../../model/categoryModel")
const productModel = require("../../model/productModel")
const passport = require("passport")
const { googleSignIn } = require("../../../googleAuth")
const cartDetails = require("../../model/cartModel")




const home = async (req, res) => {
    try {
        const cartData = await cartDetails.find({ username: req.session.userName })
        const cartCount = cartData.length;
        const productData = await productModel.find({ display: true, list: 0 })
        const Category = await catDetails.find({ list: 0 })


        userIn = req.session.userName;
        res.render("home", { productData, Category, userIn, cartData, cartCount })

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error in the home usercontroller in user side : " + e)
    }
}

const errorPage = async (req, res) => {
    res.render("error")
}

const checkUser = async (req, res, next) => {
    try {
        const data = await userDetails.find({ username: req.session.userName })
        console.log(data);
        if (data.length > 0) {
            if (data[0].status == 0) {
                console.log("worked" + data.status);
                next()

            } else {
                console.log("oooo" + data.status);
                req.session.destroy()
                res.redirect("/login?block=you have been blocked")
            }
        } else {
            res.redirect("/login?block=Please Sign In")
        }

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error in the checkUser usercontroller in user side : " + e);
    }
}

const login = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {
            const block = req.query.block
            const username = req.query.username
            const pass = req.query.pass



            res.render("login", { block, username, pass })
        }
    } catch (e) {
        res.redirect("/errorPage")
        console.log("error in the login usercontroller in user side : " + e);
    }
}


const validateUser = async (req, res) => {

    try {
        
        
        const userLogin = await userDetails.findOne({ username: req.body.username })
        console.log(userLogin)

        if (userLogin) {
            if (userLogin.status == 0) {
                
                const data = await bcrypt.compare(req.body.password, userLogin.password)
                console.log(data);
                if (data) {

                    req.session.isUser = true
                    req.session.userName = req.body.username
                    res.redirect("/home")
                } else {
                    res.redirect("/login?pass=incorrect password")
                }
            } else {
                res.redirect("/login?block= Entry for you have been denied")
            }
        } else {
            res.redirect("/login?username=incorrect username")
        }


    } catch (e) {
        res.redirect("/errorPage")
        console.log("error in the validateUser usercontroller in user side : " + e);
    }
}



const signout = async (req, res) => {
    try {
        await req.session.destroy()
        console.log("session exit");
        res.redirect("/")

    } catch (e) {
        res.redirect("/errorPage")
        console.log("error in the signout usercontroller in user side : " + e);
    }
}


const reset_password = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {
            const val = req.query.fail
            const cat = await catDetails.find({ list: 0 })
            res.render("user-pass-reset", { val, cat })
        }


    } catch (e) {
        res.redirect("/errorPage")
        console.log("error in the reset_password usercontroller in user side : " + e);
    }
}



// Google SignIn
const google = googleSignIn.authenticate('google', {
    scope: ['email', 'profile']
});

const googleCallback = googleSignIn.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/auth/failure'
});

const authFailure = (req, res) => {
    res.send('Something went wrong..');
};


module.exports = { home, login, validateUser, signout, reset_password, checkUser, google, googleCallback, authFailure, errorPage }