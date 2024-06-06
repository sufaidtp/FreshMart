const mongoose = require("mongoose")
mongoose.connect(process.env.MONGO_CONNECTOR)
const cartSChema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    product: {
        type: String,
        required: true
    },


    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quentity: {
        type: Number,
        required: 1
    },
    offerPrice: {
        type: Number
    },
    offer: {
        type: Number
    }
})

module.exports = mongoose.model("cartDetails", cartSChema)