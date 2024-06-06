const mongoose=require("mongoose")
mongoose.connect(process.env.MONGO_CONNECTOR)
const couponSchema=new mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },
    expiry:{
        type:Date,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    minimumAmount:{
        type:Number,
        required:true
    }
})


module.exports=mongoose.model("couponDetails",couponSchema)
