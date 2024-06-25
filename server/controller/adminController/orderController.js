const orderDetails = require("../../model/ordersModel")
const couponDetails = require("../../model/couponmodel")
const walletDetails = require("../../model/walletModel")
const categoryDetails = require("../../model/categoryModel")
const fs = require("fs");
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer");
const ExcelJS = require('exceljs');
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
        
        const data = await orderDetails.findOne({ orderID: req.query.orderId });
        const result = await orderDetails.updateOne(
            {
                orderID: req.query.orderId,
                'products._id': new ObjectId(req.query.id)
            },
            {
                $set: { 'products.$.username': req.body.status }
            }
        );
        if (req.body.status === "Delivered Successfully") {
            
            const updatedData = await orderDetails.findOne({ orderID: req.query.orderId });
            let count = 0;
            for (let i = 0; i < updatedData.products.length; i++) {
                if (updatedData.products[i].username === "Delivered Successfully") {
                    console.log(updatedData.products[i].username ,"value",i);
                    count++;
                    
                } else {
                    
                    break;
                }
            }
            
            
            if (count == data.products.length) {

                await orderDetails.updateOne(
                    {
                        orderID: req.query.orderId,
                    },
                    {
                        $set: { status: req.body.status },
                    }
                );
            }
        }
        

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
        
        const couponFound = await couponDetails.find({ couponName: req.body.coupon })
        
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
        
        await couponDetails.deleteOne({ couponName: req.query.name })
        res.redirect("/admin/coupon?found=Coupon Removed")


    } catch (e) {
        console.log("error with remove coupon adminside" + e);
    }
}

const editCoupon = async (req, res) => {


    try {
        

        const couponFounde = await couponDetails.findOne({ couponName: req.query.name })
        
        if (req.body.discount < req.body.minAmount) {
            if (!couponFounde || (req.body.oldcoupon == couponFounde.couponName)) {
                
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
        
        const data = await orderDetails.findOne({ orderID: req.query.id })
        res.render("orderReturn", { data })
    } catch (e) {
        console.log("error with returnView" + e);
    }
}
const handleReturnRequest = async (req, res) => {
    
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
                await addTransactionToWallet(orderNew.user, productDetails.offerPrice, 'Credited', productDetails.return_Reason);

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

        
        await walletDetails.updateOne(
            { userId: new mongoose.Types.ObjectId(userData._id) },
            {
                $inc: { wallet: +amount },
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

const salesReport = async (req, res) => {
    try {
        const { startDate, endDate, format } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);

        

        const Product = await orderDetails.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $unwind: "$products",
            },
            {
                $match: { "products.username": "Delivered Successfully" },
            },
            {
                $group: {
                    _id: "$products.product",
                    totalOrders: { $sum: 1 },
                }
            },
            {
                $sort: { totalOrders: -1 },
            },
            {
                $limit: 3,
            },
        ]);
       

        const status = await orderDetails.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $unwind: "$products",
            },
            {
                $group: {
                    _id: "$products.username",
                    count: { $sum: 1 }
                }
            }
        ]);
        

        const couponDiscounts = await orderDetails.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    },
                },
            },
            {
                $match: { "products.username": "Delivered Successfully" },
            },
            {
                $group: {
                    _id: "",
                    couponDiscount: { $sum: "$discount" },
                },
            },
        ]);
        

        const revenue = await orderDetails.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    },
                },
            },
            {
                $unwind: "$products",
            },
            {
                $match: {
                    "products.username": "Delivered Successfully",
                },
            },
            {
                $project: {
                    amount: {
                        $multiply: ["$products.quentity", "$products.offerPrice"],
                    },
                },
            },
            {
                $group: {
                    _id: "",
                    total_revenue: { $sum: "$amount" },
                },
            },
        ]);
        

        const totalofferReduction = await orderDetails.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    },
                }
            },
            {
                $unwind: "$products",
            },
            {
                $match: {
                    "products.username": "Delivered Successfully"
                }
            },
            {
                $group: {
                    _id: "",
                    prbd: { $sum: "$products.price" },
                    prad: { $sum: "$products.offerPrice" }
                }
            }
        ]);

        let offerDiscount = totalofferReduction[0].prbd - totalofferReduction[0].prad;
        

        const orderData = await orderDetails.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    },
                }
            },
            {
                $unwind: "$products",
            },
            {
                $match: { "products.username": "Delivered Successfully" },
            },
            {
                $sort: { date: 1 }
            }
        ]);

        if (format === 'excel') {
            // Generate Excel report
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');

            worksheet.columns = [
                { header: '#', key: 'index', width: 5 },
                { header: 'User', key: 'user', width: 20 },
                { header: 'DoO', key: 'date', width: 15 },
                { header: 'Order ID', key: 'orderID', width: 20 },
                { header: 'Shipped to', key: 'fullname', width: 20 },
                { header: 'Product Name', key: 'product', width: 20 },
                { header: 'Rate', key: 'offerPrice', width: 10 },
                { header: 'Qty', key: 'quantity', width: 10 },
                { header: 'Offer any', key: 'offer', width: 10 },
                { header: 'Paid By', key: 'paymentMethod', width: 15 },
            ];

            orderData.forEach((item, index) => {
                worksheet.addRow({
                    index: index + 1,
                    user: item.user,
                    date: item.date.toLocaleDateString(),
                    orderID: item.orderID,
                    fullname: item.address.fullname,
                    product: item.products.product,
                    offerPrice: item.products.offerPrice,
                    quantity: item.products.quentity,
                    offer: item.products.price - item.products.offerPrice,
                    paymentMethod: item.paymentMethod
                });
            });
            const startRow = orderData.length + 3;

            worksheet.getRow(startRow).values = ['Order Status'];
            worksheet.getRow(startRow).font = { bold: true };

            const statusStartRow = startRow + 1;

            worksheet.getCell(`A${statusStartRow}`).value = '#';
            worksheet.getCell(`B${statusStartRow}`).value = 'Status';
            worksheet.getCell(`C${statusStartRow}`).value = 'Count';

            status.forEach((item, index) => {
                const rowIndex = statusStartRow + index + 1;
                worksheet.getCell(`A${rowIndex}`).value = index + 1;
                worksheet.getCell(`B${rowIndex}`).value = item._id;
                worksheet.getCell(`C${rowIndex}`).value = item.count;
            });
            // Adding summary data
            const summaryStartRow = statusStartRow + status.length + 3;

            worksheet.getRow(summaryStartRow).values = [`Total coupon deductions made: ₹ ${couponDiscounts[0].couponDiscount}`];
            worksheet.getRow(summaryStartRow + 1).values = [`Total Offer discounts: ₹ ${offerDiscount}`];
            worksheet.getRow(summaryStartRow + 2).values = [`Total Revenue generated: ₹ ${revenue[0].total_revenue}`];

            const excelPath = path.join(__dirname, 'report.xlsx');
            await workbook.xlsx.writeFile(excelPath);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
            fs.createReadStream(excelPath).pipe(res).on('finish', () => {
                fs.unlink(excelPath, err => {
                    if (err) throw err;
                });
            });
        } else {
            // Generate PDF report
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sales Report - getantiques</title>
                <style>
                    body {
                        margin-right: 20px;
                    }
                </style>
            </head>
            <body>
                <h2 align="center"> Sales Report  FreshMart</h2>
                From: ${startDate}<br>
                To: ${endDate}<br>
                <center>
                <h3>Orders  </h3>
                    <table style="border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #000; padding: 8px;">#</th>
                                <th style="border: 1px solid #000; padding: 8px;">User</th>
                                <th style="border: 1px solid #000; padding: 8px;">DoO</th>
                                <th style="border: 1px solid #000; padding: 8px;">Order ID</th>
                                <th style="border: 1px solid #000; padding: 8px;">Shipped to</th>
                                <th style="border: 1px solid #000; padding: 8px;">Product Name</th>
                                <th style="border: 1px solid #000; padding: 8px;">Rate</th>
                                <th style="border: 1px solid #000; padding: 8px;">Qty</th>
                                <th style="border: 1px solid #000; padding: 8px;">Offer any</th>
                                <th style="border: 1px solid #000; padding: 8px;">Paid By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderData.map((item, index) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding-left: 8px;">${index + 1}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.user}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.date.toLocaleDateString()}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.orderID}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.address.fullname}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.products.product}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.products.offerPrice}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.products.quentity}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.products.price - item.products.offerPrice}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.paymentMethod}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </center>
                <br>
                <center>
                <h3>Order Status</h3>
                    <table style="border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #000; padding: 8px;">#</th>
                                <th style="border: 1px solid #000; padding: 8px;">Status</th>
                                <th style="border: 1px solid #000; padding: 8px;">Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${status.map((item, index) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 8px;">${index + 1}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item._id}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.count}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </center>
                <br>
                <center>
                <h3>Total coupon deductions made: <span>₹ ${couponDiscounts[0].couponDiscount}</span></h3>
                <br>
                 <h3>Total Offer discounts: <span>₹ ${offerDiscount}</span></h3>
                <h3>Total Revenue generated: <span>₹ ${revenue[0].total_revenue}</span></h3>
                </center>
                <p style="padding-left:20px;">Summary:<br>A total  of ${orderData.length} products has been delivered. Total revenue generated is worth ₹ ${revenue[0].total_revenue}. An amount of ₹ ${couponDiscounts[0].couponDiscount} was provided as coupon discount and offer price in the terms of product/category offer was sum up to ${offerDiscount}. </p>
            </body>
            </html>
        `;

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
        }
    } catch (err) {
        console.error(err);
        res.redirect('/admin/errorPage');
    }
};




module.exports = { orderHistory, order_Detail, changeStatus, coupon, addCoupon, removeCoupon, editCoupon, returnView, handleReturnRequest, salesReport }