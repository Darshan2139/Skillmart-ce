const Razorpay = require("razorpay");


const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY;
const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

exports.instance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});