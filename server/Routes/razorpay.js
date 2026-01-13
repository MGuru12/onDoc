const { verifyAccessToken } = require("../Controllers/auth");
const { validatePlan, createOrder, verifyPayment } = require("../Controllers/razorpay");
const router = require("express").Router();

router.post('/create-order', verifyAccessToken, validatePlan, createOrder);

router.post('/verify-payment', verifyAccessToken, verifyPayment);

module.exports = router;