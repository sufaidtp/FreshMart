const moongose=require("mongoose")
moongose.connect(process.env.MONGO_CONNECTOR)
const wishlistSchema=new moongose.Schema({
    username:{
        type:String,
        required:true
    },
    product:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        requrd:true
    }
    
})
 module.exports=moongose.model("wishDetails",wishlistSchema)
