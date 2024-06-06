
const userDetails = require("../model/userModel")

const isUser = async (req, res, next) => {
    const userLogin = await userDetails.findOne({ username:req.session.userName })
    
    if (req.session.isUser && userLogin.status == 0) {
        next();
    }
    else {
        req.session.isUser=false 
        await req.session.destroy()

        res.redirect("/login?message=login again");
    }
}
module.exports = { isUser }