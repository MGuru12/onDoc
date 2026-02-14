const { verifyAccessToken } = require("../Controllers/auth");
const { validatePlan, createOrder, verifyPayment, getPlanDetails } = require("../Controllers/razorpay");
const router = require("express").Router();

router.get('/plan-details', verifyAccessToken, getPlanDetails);

router.post('/create-order', verifyAccessToken, validatePlan, createOrder);

router.post('/verify-payment', verifyAccessToken, verifyPayment);

module.exports = router;