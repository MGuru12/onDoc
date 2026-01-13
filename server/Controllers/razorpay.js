const clientModel = require("../model/ClientModel");
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
require('dotenv').config();

// Initialize Razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Plan prices in paise (₹1 = 100 paise)
const PLAN_PRICES = {
  basic: 10000,    // ₹100
  standard: 30000, // ₹300
  premium: 60000   // ₹600
};

// Middleware to verify plan validity
const validatePlan = (req, res, next) => {
  const { plan } = req.body;
  if (!PLAN_PRICES[plan]) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }
  req.planAmount = PLAN_PRICES[plan];
  next();
};

// 1. Create Razorpay Order
const createOrder = async(req, res) => {
  try {
    const options = {
      amount: req.planAmount, // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: req.body.plan,
        userId: req.body.userId // Pass user ID from frontend
      }
    };
    console.log("Razorpay initialized");
    console.log(process.env.RAZORPAY_KEY_ID);
    console.log(process.env.RAZORPAY_KEY_SECRET);
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
}

// 2. Verify Payment Signature
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan
    } = req.body;

    const { _id } = req.JWT;

    const Client = await clientModel.findById(_id);
    if (!Client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    console.log("1");
    
    const now = new Date();
    const oneMonthLater = Date.now() + 30 * 24 * 60 * 60 * 1000;
    console.log("2");
    console.log(Client.plan);
    console.log(plan);
    
    // 🔑 PLAN LOGIC
    if (Client.plan.activeUntil && Client.plan.activeUntil > now) {
      // Plan still active → queue next plan
      Client.plan.nextPlan = plan;
    } else {
      // Plan expired or free → activate immediately
      Client.plan.currentPlan = plan;
      Client.plan.updatedAt = now;
      Client.plan.activeUntil = oneMonthLater;
      Client.plan.nextPlan = null;
    }

    await Client.save();

    res.json({
      success: true,
      message: 'Payment verified and plan updated successfully',
      plan: Client.plan
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

module.exports = {verifyPayment, createOrder, validatePlan};