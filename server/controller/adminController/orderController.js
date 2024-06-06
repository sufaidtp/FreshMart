const orderDetails = require("../../model/ordersModel")
const couponDetails = require("../../model/couponmodel")
const walletDetails = require("../../model/walletModel")

const mongoose = require('mongoose');
const userModel = require("../../model/userModel");
const { ObjectId } = mongoose.Types;



const orderHistory = async (req, res) => {
    try {
        const data = await orderDetails.find({}).sort({ _id: -1 });

        res.render("adminorderHistory", { data });

    } catch (e) {
        console.log("error  with orderHistory " + e);
    }
}



const order_Detail = async (req, res) => {
    try {
        const data = await orderDetails.findOne({ orderID: req.query.id });
        res.render('OrderDetail', { data })
    } catch (e) {
        console.log('error in the orderDetails : ', e)
    }
}



const changeStatus = async (req, res) => {
    try {
        console.log(req.query)
        console.log(req.body);
        const data = await orderDetails.findOne({ orderID: req.query.orderId });
        console.log(data)
        const result = await orderDetails.updateOne(
            {
                orderID: req.query.orderId,
                'products._id': new ObjectId(req.query.id)
            },
            {
                $set: { 'products.$.username': req.body.status }
            }
        );

        console.log(result)
        res.redirect(`/admin/orderDetails?id=${req.query.orderId}`)
    } catch (e) {
        console.log('error inthechangeStatus:', e);
    }
}

const coupon = async (req, res) => {
    try {
        couponData = await couponDetails.find({})
        const couponFound = req.query.found
        res.render("adminCoupon", { couponData, couponFound })

    } catch (e) {
        console.log("error wth coupon in admin side" + e);
    }
}

const addCoupon = async (req, res) => {

    try {
        console.log(req.body)
        const couponFound = await couponDetails.find({ couponName: req.body.coupon })
        console.log(couponFound)
        console.log(couponFound.length)
        if (req.body.discount < req.body.minAmount) {
            if (couponFound.length == 0) {
                const newCoupon = new couponDetails({
                    couponName: req.body.coupon,
                    expiry: new Date(req.body.expiry),
                    discount: req.body.discount,
                    minimumAmount: req.body.minAmount,

                })
                await newCoupon.save()
                res.redirect('/admin/coupon?found= Coupon add successful')
            } else {
                res.redirect('/admin/coupon?found=Coupon Name Found')
            }
        } else {
            res.redirect('/admin/coupon?found=Discount amount should be less than minimum amount')
        }

    } catch (e) {
        console.log("error with addCoupon" + e);
    }
}

const removeCoupon = async (req, res) => {
    try {
        console.log(req.query.name, "value");
        await couponDetails.deleteOne({ couponName: req.query.name })
        res.redirect("/admin/coupon?found=Coupon Removed")


    } catch (e) {
        console.log("error with remove coupon adminside" + e);
    }
}

const editCoupon = async (req, res) => {


    try {
        console.log(req.query.name, 'req.query.name')

        const couponFounde = await couponDetails.findOne({ couponName: req.query.name })
        console.log(couponFounde)
        if (req.body.discount < req.body.minAmount) {
            if (!couponFounde || (req.body.oldcoupon == couponFounde.couponName)) {
                console.log('found')
                await couponDetails.updateOne({ couponName: req.query.name }, {
                    couponName: req.body.coupon,
                    expiry: new Date(req.body.expiry),
                    discount: req.body.discount,
                    minimumAmount: req.body.minAmount
                })
                res.redirect('/admin/coupon?found= Coupon updated successful')
            } else {
                console.log('notfound')
                res.redirect('/admin/coupon?found=Coupon Found, try different coupon code')
            }
        } else {
            res.redirect('/admin/coupon?found=Discount amount should be less than minimum amount')
        }

    } catch (e) {

        console.log('error in the editCoupon in couponController in admin side : ' + e)
    }
}

const returnView = async (req, res) => {
    try {
        console.log(req.query.id, "iddddddd");
        const data = await orderDetails.findOne({ orderID: req.query.id })
        console.log(data);
        res.render("orderReturn", { data })
    } catch (e) {
        console.log("error with returnView" + e);
    }
}
const handleReturnRequest = async (req, res) => {
    console.log("Request received:", req.body);
    try {
        const { orderId, productId, action } = req.body;
        const returnStatus = action === 'accept' ? 'Return Accepted' : 'Return Rejected';

        // Update the return status of the product in the order
        const result = await orderDetails.updateOne(
            {
                orderID: orderId,
                'products._id': new ObjectId(productId)
            },
            {
                $set: { 'products.$.username': returnStatus }
            }
        );

        console.log("Update result:", result);

        // If the return is accepted, add the amount to the user's wallet
        if (action === 'accept') {
            const order = await orderDetails.findOne(
                {
                    orderID: orderId,
                    'products._id': new ObjectId(productId)
                },
                {
                    'products.$': 1
                }
            );
            const orderNew = await orderDetails.findOne(
                {
                    orderID: orderId,
                    'products._id': new ObjectId(productId)
                },
                // {
                //     'products.$': 1
                // }
            );
           
            if (order) {
                const productDetails = order.products[0];
                await addTransactionToWallet(orderNew.user, productDetails.price, 'Credited', productDetails.return_Reason);
                
            }
        }

        res.json({ success: true, message: `Return request ${action}ed successfully.` });
    } catch (e) {
        console.log("Error with handleReturnRequest:", e);
        res.json({ success: false, message: "An error occurred." });
    }
};

// Function to add a transaction to the user's wallet
const addTransactionToWallet = async (userId, amount, transactionType, reason) => {

    try {
        // Update the wallet with the new transaction or create a new wallet entry if it doesn't exist
        const userData = await userModel.findOne({ username: userId })
        
        console.log(userId, "userData");
        await walletDetails.updateOne(
            { userId: new mongoose.Types.ObjectId(userData._id) },
            {
                $inc:{wallet:+amount},
                $push: {
                    history: {
                        transaction: transactionType,
                        amount: amount,
                        date: new Date(),
                        reason: reason 
                    }
                }
            },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error adding transaction to wallet:", error);
    }
};




module.exports = { orderHistory, order_Detail, changeStatus, coupon, addCoupon, removeCoupon, editCoupon, returnView, handleReturnRequest }