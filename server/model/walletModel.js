const mongoose = require('mongoose')
require("dotenv").config();
mongoose.connect(process.env.MONGO_CONNECTOR)

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDetails'
    },
      wallet: {
        type: Number,
        default: 0,
      },
    history: [{
        transaction: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        reason: {
            type: String
        }
    }],
});

module.exports=mongoose.model("walletDetails",walletSchema)