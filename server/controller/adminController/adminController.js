const userDetails = require("../../model/userModel")
const bcrypt = require("bcrypt")
const editCat = require("../../model/categoryModel")
const productDetails = require("../../model/productModel")
const orderDetails = require("../../model/ordersModel")
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
        
        if (adminFound && adminFound.isAdmin == 1) {
            passSuccess = await bcrypt.compare(req.body.loginPassword, adminFound.password)
            
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
        const userCount = await userDetails.find({ isAdmin: 0 }).count()
        const productCount = await productDetails.find({}).count()
        const orders = await orderDetails.distinct("orderID")
        const orderStatusP = await orderDetails.aggregate([
            { $unwind: "$products" },
            { $match: { "products.username": "Placed" } },
            { $group: { _id: "$products.username", count: { $sum: 1 } } }
        ]);

        const orderStatusC = await orderDetails.aggregate([
            { $unwind: "$products" },
            { $match: { "products.username": "cancelled" } },
            { $group: { _id: "$products.username", count: { $sum: 1 } } }
        ]);
        const orderStatusD = await orderDetails.aggregate([
            { $unwind: "$products" },
            { $match: { "products.username": "Delivered Successfully" } },
            { $group: { _id: "$products.username", count: { $sum: 1 } } }
        ]);
        const orderStatusO = await orderDetails.aggregate([
            { $unwind: "$products" },
            { $match: { "products.username": "Out for delivery" } },
            { $group: { _id: "$products.username", count: { $sum: 1 } } }
        ]);
        let codPay = await orderDetails.find({}).count()
        const online = await orderDetails.find({ paymentMethod: 'Online' }).count()
        const wallet = await orderDetails.find({ paymentMethod: 'wallet' }).count()
        codPay = codPay - online
        const orderCount = orders.length
        const totalRevenueResult = await orderDetails.aggregate([
            {
                $unwind: "$products",
            },
            {
                $match: {
                    "products.username": "Delivered Successfully"
                },
            },
            {
                $project: {
                    amount: {
                        $multiply: [
                            { $toDouble: "$products.quentity" },
                            { $toDouble: "$products.offerPrice" }
                        ]
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                },
            },
        ]);


        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

        
        const product = await orderDetails.aggregate([
            {
                $unwind: "$products",
            },
            {
                $group: {
                    _id: "$products.product",
                    totalOrderValue: { $sum: 1 },
                },
            },
            {
                $sort: { totalOrderValue: -1 }
            },
            {
                $limit: 4,
            }
        ])


        
        res.render("dashboard", { userCount, productCount, orderCount, orderStatusP, orderStatusC, orderStatusD, orderStatusO, codPay, online, wallet, totalRevenue, product })
    } catch (e) {
        console.log("problem with toDashboard" + e)

    }
}



const chartData = async (req, res) => {
    try {
        console.log('/chart-data calle')
        const Aggregation = await orderDetails.aggregate([
            {
                $match: {
                    date: { $exists: true }
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" }
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1
                }
            }
        ]);
        
        res.json(Aggregation);
    } catch (e) {

        console.log("error with chartData" + e)
        // res.status(500).json({ error: 'Internal Server Error' });
    }

}

const chartDataMonth = async (req, res) => {
    try {
        
        const Aggregation = await orderDetails.aggregate([
            {
                $match: {
                    date: { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                }
            }
        ]);
        
        res.json(Aggregation);
    } catch (error) {

        console.error(error);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
}

const chartDataYear = async (req, res) => {
    try {
        
        const Aggregation = await orderDetails.aggregate([
            {
                $match: {
                    date: { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                }
            }
        ]);
        
        res.json(Aggregation);
    } catch (error) {

        console.error(error);
        // res.status(500).json({ error: 'Internal Server Error' });
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
        
        let val = 1
        if (productData.list == 1)
            val = 0
        await editCat.updateMany({ name: name }, { $set: { list: val } })
        await productDetails.updateMany({ category: productData._id }, { $set: { list: val } })
        res.redirect(`/admin/category?val=${val}`)


    } catch (e) {
        console.log("problem with list in admin" + e);
    }

}


module.exports = { admin, adminDashboard, toDashboard, logout, user, searchUser, block, list, chartData, chartDataMonth, chartDataYear }