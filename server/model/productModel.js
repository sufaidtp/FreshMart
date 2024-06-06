const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_CONNECTOR)

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"categoryDetails",
        required: true
    },

    description: {
        type: String,
        required: true
    },

    about: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        required: true
    },

    imagePath: {
        type: Array,
        required: true
    },

    list: {
        type: Number,
        default: 0
    },

    display: {
        type: Boolean,
        default: true
    },

    offer: {
        type: Number,
    },

    discountAmount: {
        type: Number,
        // required: true
    },

    // catOffer: {
    //     type: Number,

    // }
     
})


module.exports = mongoose.model("productDetails", productSchema)