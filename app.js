const express = require("express")
const session = require("express-session")
const hbs = require("hbs")
const path = require("path")
require("dotenv").config();
const bodyParser = require("body-parser")
const passport=require("passport")

const app = express()
const userRoute = require("./server/route/userRoute")
const adminRoute = require("./server/route/adminroute")

app.set("view engine", "hbs")

app.use(passport.initialize());
// app.use(passport.session())



const partials = path.join(__dirname, "views/partials")
hbs.registerPartials(partials)



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

// to multiply two numbers in the hbs
hbs.registerHelper('multiply', function (a, b) {
    return a * b;
});

// to set the current in the correct format in hbs
hbs.registerHelper('formatDate', function (date) {
    return new Date(date).toDateString();
});

// code to check if the string is equal or note in hbs
hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// used in increment and decrement in cart page of the user
hbs.registerHelper('ifNotEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.inverse(this) : options.fn(this);
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








app.listen(4000, () => {
    console.log("server start")
})

