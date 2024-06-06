const { default: mongoose } = require("mongoose")
const moongose = require("mongoose")

mongoose.connect(process.env.MONGO_CONNECTOR)

const userAddressSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
    },
    address: {
        houseName: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    primary: {
        type: Number,
        required: true
    }

})

module.exports = mongoose.model("userAdress", userAddressSchema)