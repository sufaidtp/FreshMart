const userDetails = require("../../model/userModel")
const bcrypt = require("bcrypt")
const editCat = require("../../model/categoryModel")
const productDetails = require("../../model/productModel")

const admin = (req, res) => {
    try {
        if (req.session.isAdmin) {
            res.redirect("/admin/dashboard")
            console.log("admin login")

        } else {
            const user = req.query.invaliduser
            const pass = req.query.invalidpass
            res.render("adminLog", { user, pass })
        }

    } catch (e) {
        console.log("problem with admin" + e)

    }

}

const adminDashboard = async (req, res) => {
    try {


        // const userName = req.body.name;
        const adminFound = await userDetails.findOne({ username: req.body.loginUsername })
        console.log(adminFound)
        if (adminFound && adminFound.isAdmin == 1) {
            passSuccess = await bcrypt.compare(req.body.loginPassword, adminFound.password)
            console.log(passSuccess)
            if (passSuccess) {
                req.session.isAdmin = true
                // req.session.username = req.body.username
                res.redirect("/admin/dashboard")

            } else {
                res.redirect("/admin?invalidpass=Invalid password")
            }
        } else {
            res.redirect("/admin?invaliduser=Invalid usename")
        }

    } catch (e) {
        console.log("problem with adminDashboard" + e)

    }

}

const toDashboard = async (req, res) => {
    try {
        res.render("dashboard")
    } catch (e) {
        console.log("problem with toDashboard" + e)

    }
}


const logout = async (req, res) => {
    try {
        await req.session.destroy()
        console.log("admin logout");
        res.redirect("/admin")
    } catch (e) {
        console.log("problem with logout" + e);
    }
}


const user = async (req, res) => {
    try {
        const userData = await userDetails.find({ isAdmin: 0 }).sort({ "_id": -1 })
        console.log(userData);
        res.render("adminUserdetails", { userData })

    } catch (e) {
        console.log("problem with adminUserdetails" + e);
    }
}


const searchUser = async (req, res) => {
    try {
        const nameSearch = req.body.search
        const regex = new RegExp(`${nameSearch}`, "i")
        const userData = await userDetails.find({ $and: [{ username: { $regex: regex } }, { isAdmin: 0 }] })
        res.render("adminUserdetails", { userData, nameSearch })

    } catch (e) {
        console.log("problem with searchUser in admin" + e);
    }
}


const block = async (req, res) => {
    try {
        const name = req.params.username
        const userData = await userDetails.findOne({ username: name })
        let val = 1
        if (userData.status == 1)
            val = 0
        await userDetails.updateOne({ username: name }, { $set: { status: val } })
        res.redirect("/admin/userDetails")

    } catch (e) {
        console.log("problem with block in admin" + e);
    }
}


const list = async (req, res) => {
    try {
        const name = req.params.id
        const productData = await editCat.findOne({ name: name })
        console.log(productData);
        let val = 1
        if (productData.list == 1)
            val = 0
        await editCat.updateMany({ name: name }, { $set: { list: val } })
        await productDetails.updateMany({ category: name }, { $set: { list: val } })
        res.redirect(`/admin/category?val=${val}`)


    } catch (e) {
        console.log("problem with list in admin" + e);
    }

}


module.exports = { admin, adminDashboard, toDashboard, logout, user, searchUser, block, list }