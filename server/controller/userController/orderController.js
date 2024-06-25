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
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const os = require("os")
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
        
        const userAddress = await addressPro.findOne({ _id: req.query.id });
        const cartData = await cartDetails.find({ username: req.session.userName });
        // const stock = await productDetails.findOne({})
        
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

        


        const newOrders = new orderDetails({
            orderID: otp,
            user: req.session.userName,
            products: cartData,
            totalOrderValue: req.session.totalOrderValue,
            discount: amount,
            couponName: req.session.coupon,
            address: userAddress,
            paymentMethod: req.query.payment,
            amountPaid: req.session.totalOrderValue - amount,
            status: "placed",
            date: new Date()
        });
        await newOrders.save();
        req.session.coupon = null;
        
        // Decrease the stock for each product in the order
        for (const item of cartData) {
           
            await productDetails.updateOne(
                { name: item.product }, // Assuming productID is stored in the cart data
                { $inc: { stock: -item.quentity } } // Assuming quantity is stored in the cart data
            );
        }


        await cartDetails.deleteMany({ username: req.session.userName })
        res.redirect(`/orderPlaced?id=${otp}`)
    } catch (error) {
        res.redirect("/errorPage")
        console.log('error in the orderConfirmation:', error);
    }
};


const orderPlaced = async (req, res) => {
    try {
        const data = await orderDetails.findOne({ orderID: req.query.id });
        
        res.render('orderPlaced', { data })
    } catch (e) {
        res.redirect("/errorPage")
        console.log('error in the orderPlaced :', e);
    }
}

const orderHistory = async (req, res) => {
    try {
        const userIn = req.session.userName
        const Category = await catDetails.find({ list: 0 })
        const data = await orderDetails.find({ user: req.session.userName }).sort({ _id: -1 });
        res.render('orderHistory', { data, userIn, Category });
    } catch (e) {
        res.redirect("/errorPage")
        console.log('error in the orderHistory : ', e);
    }
}

const invoice = async (req, res) => {
    try {

        const orderData = await orderDetails.findOne({ orderID: req.query.id })

        
        date = orderData.date;
        console.log("Date is :", date.toDateString());
        const num = `${orderData.totalOrderValue}`;
        console.log(num, "num");
        const wordify = (num) => {
            const single = [
                "Zero",
                "One",
                "Two",
                "Three",
                "Four",
                "Five",
                "Six",
                "Seven",
                "Eight",
                "Nine",
            ];
            const double = [
                "Ten",
                "Eleven",
                "Twelve",
                "Thirteen",
                "Fourteen",
                "Fifteen",
                "Sixteen",
                "Seventeen",
                "Eighteen",
                "Nineteen",
            ];
            const tens = [
                "",
                "Ten",
                "Twenty",
                "Thirty",
                "Forty",
                "Fifty",
                "Sixty",
                "Seventy",
                "Eighty",
                "Ninety",
            ];
            const formatTenth = (digit, prev) => {
                return 0 == digit
                    ? ""
                    : " " + (1 == digit ? double[prev] : tens[digit]);
            };
            const formatOther = (digit, next, denom) => {
                return (
                    (0 != digit && 1 != next ? " " + single[digit] : "") +
                    (0 != next || digit > 0 ? " " + denom : "")
                );
            };
            let res = "";
            let index = 0;
            let digit = 0;
            let next = 0;
            let words = [];
            if (((num += ""), isNaN(parseInt(num)))) {
                res = "";
            } else if (parseInt(num) > 0 && num.length <= 10) {
                for (index = num.length - 1; index >= 0; index--)
                    switch (
                    ((digit = num[index] - 0),
                        (next = index > 0 ? num[index - 1] - 0 : 0),
                        num.length - index - 1)
                    ) {
                        case 0:
                            words.push(formatOther(digit, next, ""));
                            break;
                        case 1:
                            words.push(formatTenth(digit, num[index + 1]));
                            break;
                        case 2:
                            words.push(
                                0 != digit
                                    ? " " +
                                    single[digit] +
                                    " Hundred" +
                                    (0 != num[index + 1] && 0 != num[index + 2] ? " and" : "")
                                    : ""
                            );
                            break;
                        case 3:
                            words.push(formatOther(digit, next, "Thousand"));
                            break;
                        case 4:
                            words.push(formatTenth(digit, num[index + 1]));
                            break;
                        case 5:
                            words.push(formatOther(digit, next, "Lakh"));
                            break;
                        case 6:
                            words.push(formatTenth(digit, num[index + 1]));
                            break;
                        case 7:
                            words.push(formatOther(digit, next, "Crore"));
                            break;
                        case 8:
                            words.push(formatTenth(digit, num[index + 1]));
                            break;
                        case 9:
                            words.push(
                                0 != digit
                                    ? " " +
                                    single[digit] +
                                    " Hundred" +
                                    (0 != num[index + 1] || 0 != num[index + 2]
                                        ? " and"
                                        : " Crore")
                                    : ""
                            );
                    }
                res = words.reverse().join("");
            } else res = "";
            return res;
        };
        console.log(wordify(num));

        //------------------------------------------------------------------//

        // copy
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice</title>
          <style>
              /! tailwindcss v3.0.12 | MIT License | https://tailwindcss.com/,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:initial}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:initial;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:initial}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input:-ms-input-placeholder,textarea:-ms-input-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none},:after,:before{--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:#3b82f680;--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.flex{display:flex}.table{display:table}.table-cell{display:table-cell}.table-header-group{display:table-header-group}.table-row-group{display:table-row-group}.table-row{display:table-row}.hidden{display:none}.w-60{width:15rem}.w-40{width:10rem}.w-full{width:100%}.w-\[12rem\]{width:12rem}.w-9\/12{width:75%}.w-3\/12{width:25%}.w-6\/12{width:50%}.w-2\/12{width:16.666667%}.w-\[10\%\]{width:10%}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-end{align-items:flex-end}.justify-center{justify-content:center}.rounded-l-lg{border-top-left-radius:.5rem;border-bottom-left-radius:.5rem}.rounded-r-lg{border-top-right-radius:.5rem;border-bottom-right-radius:.5rem}.border-x-\[1px\]{border-left-width:1px;border-right-width:1px}.bg-gray-700{--tw-bg-opacity:1;background-color:rgb(55 65 81/var(--tw-bg-opacity))}.p-10{padding:2.5rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.px-4{padding-left:1rem;padding-right:1rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.pl-4{padding-left:1rem}.pb-20{padding-bottom:5rem}.pb-16{padding-bottom:4rem}.pb-1{padding-bottom:.25rem}.pb-2{padding-bottom:.5rem}.pt-20{padding-top:5rem}.pr-10{padding-right:2.5rem}.pl-24{padding-left:6rem}.pb-6{padding-bottom:1.5rem}.pl-10{padding-left:2.5rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.font-bold{font-weight:700}.font-normal{font-weight:400}.text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128/var(--tw-text-opacity))}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity))}.text-gray-400{--tw-text-opacity:1;color:rgb(156 163 175/var(--tw-text-opacity))}.text-black{--tw-text-opacity:1;color:rgb(0 0 0/var(--tw-text-opacity))}
          </style>
      </head>
      <body>
          <div class="p-10">
              <!--Logo and Other info-->
              <div class="flex items-start justify-center">
                  <div class="flex-1">
                      <div class="w-60 pb-6">
                          <img class="w-40" src="http://localhost:4000/img/logo.png" alt="FreshMart">
                      </div>
                      
                      <div class="w-60 pl-4 pb-6">
                          <h3 class="font-bold">Fresh Mart</h3>
                          <p>12th cross, 80th feet Road</p>
                          <p>HSR</p>
                          <p>Bangalore 560075</p>
                      </div>
                      
                      <div class="pl-4 pb-20">
                          <p class="text-gray-500">Shipping to:</p>
                          <h3 class="font-bold">${orderData.address.fullname
            }</h3>
                          <h3>${orderData.address.address.houseName}, ${orderData.address.address.city
            }, ${orderData.address.address.state}</h3>
                          <h3>${orderData.address.address.country}, ${orderData.address.address.pincode
            } - ${orderData.address.phone}</h3>
                      </div>
                      
                  </div>
                  <div class="flex items-end flex-col">
      
                      <div class="pb-16">
                          <h1 class=" font-normal text-4xl pb-1">Invoice</h1>
                          <br><p class="text-right text-gray-500 text-xl"></p>
                          <p class="text-right text-gray-500 text-xl">#: ${orderData.orderID
            }</p>
                      </div>
      
                      <div class="flex">
                          <div class="flex flex-col items-end">
                              <p class="text-gray-500 py-1">Date: </p>
                              <p class="text-gray-500 py-1">Payment Method:</p>
                              
                          </div>
                          <div class="flex flex-col items-end w-[12rem] text-right">
                              <p class="py-1">${date.toDateString()}</p>
                              <p class="py-1 pl-10">${orderData.paymentMethod}</p>
                              
                          </div>
                      </div>
                  </div>
              </div>
              
              <!--Items List-->
      <div class="table w-full">
                  <div class=" table-header-group bg-gray-700 text-white ">
                      <div class=" table-row ">
                          <div class=" table-cell w-6/12 text-left py-2 px-4 rounded-l-lg border-x-[1px]">Item</div>
                          <div class=" table-cell w-[10%] text-center border-x-[1px]">Qty</div>
                          <div class=" table-cell w-2/12 text-center border-x-[1px]">Unit Price</div>
                          
                          <div class=" table-cell w-2/12 text-center rounded-r-lg border-x-[1px]">Amount</div>
                      </div>
                  </div>
      
                  <div class="table-row-group">
                      ${getDeliveryItemsHTML(orderData)}
                  </div>
              </div>
              
              <!--Total Amount-->
              <div class=" pt-10 pr-10 text-right">
                  
              </div>
            
              <div class=" pt-20 pr-10 text-right">
                  <p class="text-gray-400">Total: <span class="pl-24 text-black">₹${orderData.totalOrderValue
            }
                </span></p>
              </div>
  
              <div class=" pt-10 pr-10 text-left">
                  <p class="text-gray-400">Amount in Words: <span class="pl-24 text-black">${wordify(
                num
            )}</span></p>
              </div> 
      
              <!--Notes and Other info-->
              <div class="py-6">
              <br>
                  <p class="text-gray-400 pb-2">Notes: <span>Thanks for ordering with us.</span></p> </div>
      
              <div class="">
                  <p class="text-gray-400 pb-2">Terms: <span style="font-size:8px;">Invoice is Auto generated at the time of delivery,if there is any issue contact provider.</span></p>
                  
              </div>
          </div>
      </body>
      </html>
      `;

        function getDeliveryItemsHTML(orderData) {
            let data = "";
            orderData.products.forEach((value) => {
                data += `
      <div class="table-row">
          <div class=" table-cell w-6/12 text-left font-bold py-1 px-4">${value.product
                    }</div>
          <div class=" table-cell w-[10%] text-center">${value.quentity
                    }</div>
          <div class=" table-cell w-2/12 text-center">₹${value.offerPrice}</div>
          <div class=" table-cell w-2/12 text-center">₹${value.offerPrice * value.quentity
                    }</div>
      </div>
      `;
            });
            return data;
        }
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        await page.emulateMediaType('screen');

        const pdfPath = path.join(__dirname, 'report.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
        fs.createReadStream(pdfPath).pipe(res).on('finish', () => {
            fs.unlink(pdfPath, err => {
                if (err) throw err;
            });
        });


    } catch (e) {
        console.log("error with invoice" + e);
        res.redirect("/errorPage")
    }
}

const orderDetail = async (req, res) => {
    try {
        const Category = await catDetails.find({ list: 0 })
        const userIn = req.session.userName
        const data = await orderDetails.findOne({ orderID: req.query.id });
        
        res.render('orderDetails', { data, userIn, Category });
    } catch (e) {
        res.redirect("/errorPage")
        console.log('error in the orderDetails', e);
    }
}

const cancelOrder = async (req, res) => {
    try {

       

        const data = await orderDetails.findOne({ orderID: req.query.id })
        
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

        await addTransactionToWallet(orderNew.user, productDetails.offerPrice, 'Credited', "Cancelled");
        res.redirect(`/orderDetail?id=${req.query.id}`)

    } catch (e) {
        res.redirect("/errorPage")
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
        res.redirect("/errorPage")
        console.error("Error adding transaction to wallet:", error);
    }
};




const createOrder = async (req, res) => {
    
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
        res.redirect("/errorPage")
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
        res.redirect("/errorPage")
        console.log("error with remove coupon" + e);
    }
}



const orderReason = async (req, res) => {


    try {
        

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
        res.redirect("/errorPage")
        console.log("error with orderReason" + e);
    }
}

const walletPay = async (req, res) => {

    try {

        const { total } = req.body;
        const user = await userDetails.findOne({ username: req.session.userName })
        const walletData = await walletDetails.findOne({ userId: user._id })

        if (walletData.wallet >= total) {
            const wData = await walletDetails.updateOne({ userId: user._id }, {
               $inc : {wallet:-total},
               $push:{

                history: {
                    transaction: "debit",
                    amount: total,
                    date: new Date(),
                    reason: "purchase"
                },
            }
            },
            { upsert: true }
        );
            
            
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Insufficient wallet balance' });
        }


    } catch (e) {
        console.log("error with walletpay" + e);
        res.redirect("/errorPage")

    }
}


const walletView = async (req, res) => {
    try {
        const Category = await catDetails.find({ list: 0 })
        const userIn = req.session.userName;
        const userData = await userDetails.findOne({ username: userIn })
        const value = await walletDetails.find({ userId: userData._id })
        const data = value[0]
        res.render("wallet", { Category, userIn, data })

    } catch (e) {
        res.redirect("/errorPage")
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
    walletPay,
    walletView,
    invoice

}