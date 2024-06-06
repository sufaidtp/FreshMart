const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const catDetails = require("../../model/categoryModel")
const wishDetails = require("../../model/wishlistModel")
const cartDetails = require("../../model/cartModel")
const sndmail = require("../userController/generateOtp")
const otpGenerator = require("otp-generator")
const couponDetails = require("../../model/couponmodel")
const walletDetails = require("../../model/walletModel")
const bcrypt = require("bcrypt")
const sharp = require("sharp")
const session = require("express-session")
const addressPro = require("../../model/userAddressmodel")
const orderDetails = require("../../model/ordersModel")
require("dotenv").config()
const mongoose = require("mongoose")
const { ObjectId } = mongoose.Types;
const express = require('express');
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});




const orderConfirmation = async (req, res) => {
    try {
        console.log(req.query);
        const userAddress = await addressPro.findOne({ _id: req.query.id });
        const cartData = await cartDetails.find({ username: req.session.userName });
        // const stock = await productDetails.findOne({})
        console.log(userAddress);
        const otp = otpGenerator.generate(12, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        if (req.session.coupon) {
            await userDetails.updateOne(
                { username: req.session.userName },
                { $push: { coupon: req.session.coupon } }
            );

            const couponData = await couponDetails.findOne({ couponName: req.session.coupon })
            amount = couponData.discount;

        } else {
            amount = 0;
        }

        // Adding the status field to each cart item
        cartData.forEach(item => {
            item.username = 'Placed';
        });

        console.log(cartData, '././././././.......');


        const newOrders = new orderDetails({
            orderID: otp,
            user: req.session.userName,
            products: cartData,
            totalOrderValue: req.session.totalOrderValue,
            discount: amount,
            couponName: req.session.coupon,
            address: userAddress,
            paymentMethod: req.query.payment,
            status: "placed",
            date: new Date()
        });
        await newOrders.save();
        req.session.coupon = null;

        await cartDetails.deleteMany({ username: req.session.userName })
        res.redirect(`/orderPlaced?id=${otp}`)
    } catch (error) {
        console.log('error in the orderConfirmation:', error);
    }
};


const orderPlaced = async (req, res) => {
    try {
        const data = await orderDetails.findOne({ orderID: req.query.id });
        console.log(data)
        res.render('orderPlaced', { data })
    } catch (e) {
        console.log('error in the orderPlaced :', e);
    }
}

const orderHistory = async (req, res) => {
    try {
        const data = await orderDetails.find({ user: req.session.userName }).sort({ _id: -1 });
        console.log(data);
        res.render('orderHistory', { data });
    } catch (e) {
        console.log('error in the orderHistory : ', e);
    }
}

const orderDetail = async (req, res) => {
    try {
        const data = await orderDetails.findOne({ orderID: req.query.id });
        console.log(data + "zzzzzzzz");
        res.render('orderDetails', { data });
    } catch (e) {
        console.log('error in the orderDetails', e);
    }
}

const cancelOrder = async (req, res) => {
    try {

        console.log(req.query.id);

        const data = await orderDetails.findOne({ orderID: req.query.id })
        console.log(data);
        const result = await orderDetails.updateOne(
            {
                orderID: req.query.id,
                'products._id': new ObjectId(req.query.new)
            },
            {
                $set: { 'products.$.username': "cancelled" }
            }
        );


        const order = await orderDetails.findOne(
            {
                orderID: req.query.id,
                'products._id': new ObjectId(req.query.new)
            },
            {
                'products.$': 1
            }
        );

        const orderNew = await orderDetails.findOne(
            {
                orderID: req.query.id,
                'products._id': new ObjectId(req.query.new)
            },
            // {
            //     'products.$': 1
            // }
        );

        const productDetails = order.products[0];

        await addTransactionToWallet(orderNew.user, productDetails.price, 'Credited', "Cancelled");
        res.redirect(`/orderDetail?id=${req.query.id}`)

    } catch (e) {
        console.log("error with cancelOrder", e);
    }
}


// Function to add a transaction to the user's wallet
const addTransactionToWallet = async (userId, amount, transactionType, Reason) => {

    try {
        const userData = await userDetails.findOne({ username: userId })


        await walletDetails.updateOne(
            { userId: new mongoose.Types.ObjectId(userData._id) },
            {
                $inc: { wallet: +amount },
                $push: {
                    history: {
                        transaction: transactionType,
                        amount: amount,
                        date: new Date(),
                        reason: Reason
                    }
                }
            },
            { upsert: true }
        );
    } catch (error) {
        console.error("Error adding transaction to wallet:", error);
    }
};




const createOrder = async (req, res) => {
    console.log(req.body, "value in")
    let amount

    if (req.session.coupon) {
        const couponData = await couponDetails.findOne({ couponName: req.session.coupon })
        amount = req.body.amount - couponData.discount;
    } else {
        amount = req.body.amount;
    }

    const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: 'receipt#1'
    };
    console.log("hlo");
    razorpay.orders.create(options, (err, order) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(order);
    });
}
const verifyPayment = async (req, res) => {
    res.json({ status: 'Payment successful' });
}


const applyCoupon = async (req, res) => {
    try {
        const { couponCode, cartTotal } = req.body;
        const coupon = await couponDetails.findOne({ couponName: couponCode });
        const incoupon = await userDetails.findOne({ username: req.session.userName } && { coupon: couponCode })
        if (incoupon) {
            return res.status(400).json({ error: "Coupon already used" });
        }

        if (!coupon) {
            return res.status(400).json({ error: "Invalid coupon code" });
        }

        if (new Date(coupon.expiry) < new Date()) {
            return res.status(400).json({ error: "Coupon has expired" });
        }

        if (cartTotal < coupon.minimumAmount) {
            return res.status(400).json({ error: `Minimum order amount for this coupon is Rs.${coupon.minimumAmount}` });

        }

        const couponApplied = "success"
        const discount = coupon.discount;
        const totalAfterDiscount = cartTotal - discount;
        req.session.coupon = couponCode
        res.json({ discount, totalAfterDiscount, couponApplied });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeCoupon = async (req, res) => {
    try {
        req.session.coupon = null
        const { cartTotal } = req.body;
        const total = cartTotal;
        res.json({ total });

    } catch (e) {
        console.log("error with remove coupon" + e);
    }
}



const orderReason = async (req, res) => {


    try {
        console.log(req.query.id, "new");

        const { orderId, returnReason } = req.body;
        await orderDetails.updateMany(
            {
                orderID: orderId,
                'products._id': new ObjectId(req.query.id)
            },
            {
                $set: { 'products.$.return_Reason': returnReason }
            }
        );

        res.redirect(`/orderDetail?id=${orderId}`)
    } catch (e) {
        console.log("error with orderReason" + e);
    }
}


const walletView = async (req, res) => {
    try {
        const Category = await catDetails.find({ list: 0 })
        const userIn = req.session.userName;
        const userData = await userDetails.findOne({ username: userIn })
        console.log(userData);
        const value = await walletDetails.find({ userId: userData._id })
        console.log(value[0], "worked");
        const data = value[0]
        res.render("wallet", { Category, userIn, data })

    } catch (e) {
        console.log("error with wallet view" + e);
    }
}


module.exports = {
    orderConfirmation,
    orderPlaced,
    orderHistory,
    orderDetail,
    cancelOrder,
    createOrder,
    verifyPayment,
    applyCoupon,
    removeCoupon,
    orderReason,
    walletView

}