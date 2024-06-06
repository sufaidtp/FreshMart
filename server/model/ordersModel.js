const mongoose = require("mongoose")
mongoose.connect(process.env.MONGO_CONNECTOR)

const orderSChema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
    trim: true,
  },

  user: {
    type: String,
    required: true,
    trim: true,
  },

  products: {
    type: Array,
    required: true,
    trim: true,
  },

  totalOrderValue: {
    type: Number,
    required: true,
    trim: true,
  },

    discount: {
      type: Number,
      required: true,
      trim: true,
    },

    couponName: {
      type: String,
      trim: true,
    },


  address: {
    type: Object,
    required: true,
    trim: true,
  },

  paymentMethod: {
    type: String,
    required: true,
    trim: true,
  },

  date: {
    type: Date,
    trim: true,
  },

  status: {
    type: String,
    required: true,
    trim: true,
  },





  cancel: {
    type: String,
    trim: true,
  },
  returnStatus: {
    type: Number
  },
  amountPaid: {
    type: Number
  }
});

module.exports = mongoose.model("orderDetails", orderSChema);
