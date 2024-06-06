const Handlebars = require('handlebars');

module.exports = {
    multiply: function(price, quantity) {
        return (price * quantity).toFixed(2);
    },
    calculateTotal: function(cartData) {
        let total = 0;
        for (let i = 0; i < cartData.length; i++) {
            total += cartData[i].price * cartData[i].quentity;
        }
        return total.toFixed(2);
    },
    calculateGrandTotal: function(cartData) {
        let total = 0;
        for (let i = 0; i < cartData.length; i++) {
            total += cartData[i].price * cartData[i].quentity;
        }
        // Assuming a fixed shipping cost of $10
        return (total + 10).toFixed(2);
    },
    json: function(context) {
        return JSON.stringify(context);
    }
};

// Register the helpers with Handlebars
Handlebars.registerHelper('multiply', module.exports.multiply);
Handlebars.registerHelper('calculateTotal', module.exports.calculateTotal);
Handlebars.registerHelper('calculateGrandTotal', module.exports.calculateGrandTotal);
Handlebars.registerHelper('json', module.exports.json);