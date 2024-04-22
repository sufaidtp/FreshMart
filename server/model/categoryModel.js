const mongoose=require("mongoose")

mongoose.connect(process.env.MONGO_CONNECTOR)

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    list:{
        type:Number,
        required:true
    },
    offer:{
        type:Number
    }
})

module.exports = mongoose.model('categoryDetails',categorySchema)