const isAdmin = (req, res, next) => {
    try {
        if (req.session.isAdmin) {
            console.log("req.session.isAdmin")
            next()
        } else {
            console.log("not admin");
            res.redirect("/admin")
        }
    } catch (e) {
        console.log("Admin controller isAdmin " + e)
    }
}


module.exports = { isAdmin }