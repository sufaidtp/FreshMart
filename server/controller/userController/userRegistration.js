const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const catDetails = require("../../model/categoryModel")
const bcrypt = require('bcrypt')
const sndmail = require("../userController/generateOtp")
const walletDetails=require("../../model/walletModel")



const register = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {
            if (req.query.uname) {
                const { username, email, phone, password } = req.session.details
                uname = req.query.uname

                res.render("register", { uname, username, email, phone, password })
            } else {
                res.render("register")

            }
        }


    }
    catch (e) {
        console.log("error in the register usercontroller in user side : " + e);
    }

}

var OTP
var time


const registerUser = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {
            console.log(req.body);
            const { username, email, moblieno, password } = req.body
            req.session.details = req.body
            console.log(email)
            const userFound = await userDetails.findOne({ username: username })
            const emailFound = await userDetails.findOne({ email: email })
            console.log(emailFound)

            if (userFound) {
                res.redirect(`/register?uname=username already exists`)
            }
            else if (emailFound) {
                res.redirect(`/register?uname=email already exists`)

            } else {
                const otp = sndmail.sendmail(email)
                otp.then((val) => {
                    OTP = val[0]
                    time = val[1]
                    console.log(OTP)
                    console.log(val[1])
                }).catch((err) => {
                    console.log("ERRORR OCCUREDE IN REGISTERUSER : " + err)
                })
                res.redirect("/otp_page")
            }
        }

    } catch (e) {
        console.log("error in the registerUser userRegistration in user side : " + e);
    }

}

const otpPage = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {
            let msg = req.query.msg
            res.render("otp", { msg })
        }


    } catch (e) {
        console.log("error in the otpPage userregistration in user side : " + e);

    }
}

var resendOTP
const otpVerification = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {

            console.log("kn")
            console.log(req.body.otp)
            const otptime = Date.now()
            const diff = otptime - time
            console.log(diff)
            console.log(req.session.details);
            if (OTP == req.body.otp || resendOTP == req.body.otp) {
                if (diff <= 300000) {

                    const { username, email, phone, password } = req.session.details

                    // console.log("gggg")
                    // console.log(user)
                    // console.log(user.password);
                    // password bcrypt
                    const hashedpass = await bcrypt.hash(password, 10)

                    const userData = new userDetails({
                        username: username,
                        email: email,
                        phone: phone,
                        password: hashedpass,
                        isAdmin: 0,
                        status: 0
                    })
                    console.log("User added to the database!!!!!!")
                    await userData.save()
                    const wallet = new walletDetails({
                        userId: userData._id,
                        wallet: 0,
                        history: [],
                      });
                      await wallet.save();
                    res.redirect("/login")
                } else {
                    res.redirect("/register?uname=Time expierd")
                }

            } else {
                res.redirect("/otp_Page?msg=invalied OTP")
            }
        }

    } catch (e) {
        console.log("error in the otpVerification userregistration in user side : " + e);

    }
}

var resetOtp

const resetotpv = async (req, res) => {
    console.log(req.body.otp);
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {
            const email = req.body.otp
            const emailFound = await userDetails.findOne({ email: email })
            console.log(emailFound);
            if (emailFound) {
                const otp = sndmail.sendmail(email)
                otp.then((val) => {
                    console.log("otp: : " + val)
                    resetOtp = val
                    console.log(resetOtp);
                }).catch((err) => {
                    console.log("error in generating the otp in resetotp in user side : " + err)
                })
                req.session.changepass = req.body.otp
                res.redirect('/reset_otp_verification')

            } else {
                res.redirect('/user-reset-password?fail=Email is not correct')
            }
        }

    } catch (e) {
        console.log("error in the resetotpv userregistration in user side : " + e);

    }
}



const reset_otp_verification = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {
            notvalidotp = req.query.otpinvalid
            const cat = await catDetails.find({ list: 0 })
            res.render("newpassotp", { notvalidotp, cat })
        }

    } catch (e) {
        console.log("error in the reset_otp_verification  userregistration in user side : " + e);
    }
}

const resetotpverification = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect("/home")
        } else {
            let num = parseInt(resetOtp)
            console.log(req.body.otp);
            console.log(num);
            if (num == req.body.otp) {
                res.redirect("/reset-password")
            } else {
                res.redirect("/reset_otp_verification?otpinvalid=Invalid otp")
            }
        }

    } catch (e) {
        console.log("error in the resetotpverification userregistration in user side : " + e);
    }
}

const reset_password_get = async (req, res) => {
    try {
        if (req.session.isAdmin) {
            res.redirect("/home")
        } else {
            res.render("user-newPassword")
        }

    } catch (e) {
        console.log("error in the reset_password_get userregistration in user side : " + e);
    }

}

const newPass = async (req, res) => {
    try {
        const userFound = await userDetails.findOne({ email: req.session.changepass })
        console.log(userFound);
        const pass = req.body.newpass
        console.log(req.body.newpass);
        console.log(req.session.changepass);
        if (userFound) {
            const hashedpass = await bcrypt.hash(pass, 10)
            await userDetails.updateOne({ email: req.session.changepass }, { $set: { password: hashedpass } })
            res.redirect("/login")
        } else {
            console.log("Something went wrong in updating the password of the user");
        }


    } catch (e) {
        console.log("error in the newPass userregistration in user side : " + e);
    }
}


const verifyOldpassword = async (req, res) => {
    try {
        console.log(req.body);
        if (req.body.pass == "123") {
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }

    } catch (e) {
        console.log("error in the verifyOldpassword userregistration in user side : " + e);

    }
}
const resendotp = (req, res) => {
    try {

        let email = req.session.details.email
        const otp = sndmail.sendmail(email)
        otp.then((val) => {
            resendOTP = val[0]
            time = val[1]
            console.log(OTP)
            console.log(val[1])
        }).catch((err) => {
            console.log("ERRORR OCCUREDE IN REGISTERUSER : " + err)
        })
        res.redirect('/otp_Page')
    } catch (e) {
        console.log('error in the resendotp in userRegisterationController in user side:' + e)

    }
}


module.exports = { register, registerUser, otpPage, otpVerification, resetotpv, reset_otp_verification, resetotpverification, resendotp, reset_password_get, newPass, verifyOldpassword }