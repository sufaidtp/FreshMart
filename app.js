const express = require("express")
const session = require("express-session")
const hbs = require("hbs")
const path = require("path")
require("dotenv").config();
const bodyParser = require("body-parser")
const passport = require("passport")
const usererror = require('./server/controller/userController/userConroller')
const adminerror = require('./server/controller/adminController/adminController')

const app = express()





const userRoute = require("./server/route/userRoute")
const adminRoute = require("./server/route/adminroute")

app.set("view engine", "hbs")
const helper = require("./helper")



app.use(passport.initialize());
// app.use(passport.session())



const partials = path.join(__dirname, "views/partials")
hbs.registerPartials(partials)

hbs.registerHelper('multiply', helper.multiply);
hbs.registerHelper('calculateTotal', helper.calculateTotal);
hbs.registerHelper('calculateGrandTotal', helper.calculateGrandTotal);
hbs.registerHelper('json', helper.json);


hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
// used in increment and decrement in cart page of the user
hbs.registerHelper('ifNotEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.inverse(this) : options.fn(this);
});


hbs.registerHelper('ifNotIn', function (value, array, options) {
    // Split the array string into an array of values
    const valuesArray = array.split(',');

    // Check if the value is not in the array
    if (valuesArray.indexOf(value) === -1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});



app.use(session({
    secret: 'k5iijij@5$',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60
    }

}))


app.use((req, res, next) => {
    res.header("Cache-Control", "private,no-cache,no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
});


// Helper to negate a value
hbs.registerHelper('not', function (value) {
    return !value;
});

// Helper to check if the transaction is 'Credited'
hbs.registerHelper('isCredited', function (transaction, options) {
    return transaction === 'Credited' ? options.fn(this) : options.inverse(this);
});

// // to set the current in the correct format in hbs
hbs.registerHelper('formatDate', function (date) {
    return new Date(date).toDateString();
});




app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

app.set("views", [
    path.join(__dirname, "./views/user"),
    path.join(__dirname, "./views/admin")]);

app.use(express.static(path.join(__dirname, 'public/user')));
app.use(express.static(path.join(__dirname, 'public/admin')));
app.use(express.static(path.join(__dirname, 'public/uploads')));


app.use("/", userRoute)
app.use("/admin", adminRoute)
app.use('/*',usererror.errorPage)
app.use('/admin/*',adminerror.adminerrorPage);








app.listen(4000, () => {
    console.log("server start")
})

