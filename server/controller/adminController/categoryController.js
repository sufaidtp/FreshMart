const userDetails = require("../../model/userModel")
const productDetails = require("../../model/productModel")
const bcrypt = require("bcrypt")
const editCat = require("../../model/categoryModel")




const listCategory = async (req, res) => {
    try {
        // Fetching all category data and sorting by _id in descending order
        const listData = await editCat.find({}).sort({ "-id": -1 })
        console.log(listData);

        // Extracting any error message from the query parameters
        const categoryFound = req.query.err


        // Rendering the admin_category view with data
        res.render("adminCategory", { listData, categoryFound })

    } catch (e) {
        console.log("error in the listcategory categorycontroller in admin side : " + e);
    }
}


const save_category = async (req, res) => {
    try {
        console.log(req.body.category);

        // Finding category by name ignoring case
        const categoryFound = await editCat.find({ name: { $regex: new RegExp(req.body.category, "i") } })
        console.log(categoryFound);
        if (categoryFound.length > 0) {
            res.redirect("/admin/category?err=Category already exists")
        } else {
            if (req.body.category) {
                // Creating a new category document
                const catData = new editCat({
                    name: req.body.category,
                    list: 0,
                })
                // Saving the new category document
                await catData.save()
                res.redirect("/admin/category")
            }
        }


    } catch (e) {
        console.log("error in the  save_category categorycontroller in admin side : " + e);
    }
}

const edit_category = async (req, res) => {
    try {

        console.log(req.params.id, '/././././././/')
        console.log(req.body.name);

        const categoryData = await editCat.find({ name: req.body.name });
        if ((categoryData.length == 0) || (categoryData[0].name == req.body.oldname)) {
            console.log('data less than one')
            await editCat.updateOne({ _id: req.params.id }, { $set: { name: req.body.name, offer: req.body.offer } }, { upsert: true })
            res.redirect('/admin/category?err=Category updated successfully')
        } else {
            res.redirect('/admin/category?err=Category already exits')
        }
       
        //         const productData = await productDetails.find({ category: req.params.id })
        //         for (let i = 0; i < productData.length; i++) {

        //     let discountAmount;

        //     if (offer !== "") {
        //       // Calculate discountAmount based on offer
        //       const sum = productData[i].rate * offer;
        //       const value = sum / 100;
        //       discountAmount = productData[i].rate - value;
        //     } else {
        //       discountAmount = productData[i].rate;
        //     }

        //     // Update product details with discountAmount
        //     await productDetails.updateMany(
        //       { name: productData[i].name },
        //       { $set: { discountAmount } },
        //       { upsert: true }
        //     );
        //   }


       


    } catch (e) {
        console.log("error in the  edit_category categorycontroller in admin side : " + e)
    }
}














module.exports = { listCategory, save_category, edit_category }