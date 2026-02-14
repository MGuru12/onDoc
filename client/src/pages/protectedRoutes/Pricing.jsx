import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/Axios';
import { useUser } from '../../utils/Providers';

const Pricing = () => {
  const pricingRefs = useRef([]);
  const ctaRef = useRef(null);
  const navigate = useNavigate();
  const { usrId, usrName, usrEmail } = useUser(); // Get user context
  // console.log(process.env.VITE_RAZORPAY_KEY_ID);
  
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Mo.js animations (same as Home component)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mojs/core';
    script.async = true;
    script.onload = initAnimations;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initAnimations = () => {
    if (!window.mojs) return;

    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          const animType = entry.target.dataset.animType;
          if (animType === 'burst') createBurstAnimation(entry.target);
          else if (animType === 'ripple') createRippleAnimation(entry.target);
        }
      });
    }, observerOptions);

    [...pricingRefs.current, ctaRef.current]
      .filter(Boolean)
      .forEach(el => observer.observe(el));
  };

  const createBurstAnimation = (element) => {
    if (!window.mojs) return;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    new window.mojs.Burst({
      left: centerX,
      top: centerY,
      radius: { 0: 80 },
      count: 8,
      children: {
        shape: 'circle',
        radius: { 6: 0 },
        fill: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
        duration: 800,
        easing: 'cubic.out'
      }
    }).play();
  };

  const createRippleAnimation = (element) => {
    if (!window.mojs) return;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    new window.mojs.Shape({
      left: centerX,
      top: centerY,
      shape: 'circle',
      radius: { 0: 100 },
      fill: 'none',
      stroke: '#8b5cf6',
      strokeWidth: { 3: 0 },
      opacity: { 1: 0 },
      duration: 1000,
      easing: 'cubic.out'
    }).play();
  };

  const handleHover = (e) => {
    if (!window.mojs) return;
    const x = e.clientX;
    const y = e.clientY;

    new window.mojs.Burst({
      left: x,
      top: y,
      radius: { 0: 50 },
      count: 6,
      children: {
        shape: 'circle',
        radius: { 4: 0 },
        fill: ['#8b5cf6', '#a78bfa'],
        duration: 600,
        easing: 'cubic.out'
      }
    }).play();
  };

  const handleClick = (e) => {
    if (!window.mojs) return;
    const x = e.clientX;
    const y = e.clientY;

    new window.mojs.Burst({
      left: x,
      top: y,
      radius: { 0: 100 },
      count: 15,
      children: {
        shape: 'circle',
        radius: { 6: 0 },
        fill: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        duration: 1000,
        easing: 'cubic.out'
      }
    }).play();
  };

  // Razorpay checkout handler
  const handleCheckout = async (plan) => {
    if (!usrId) {
      toast.error('Please log in to subscribe');
      navigate('/auth/login');
      return;
    }

    try {
      // Create order on backend
      const orderRes = await api.post('/razorpay/create-order', {
        plan,
        userId: usrId
      });

      // Initialize Razorpay checkout
      const options = {
        key: process.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'OnDoc',
        description: `Subscription for ${plan} plan`,
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyRes = await api.post('/razorpay/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              userId: usrId
            });

            if (verifyRes.data.success) {
              toast.success('Payment successful! Redirecting to dashboard...');
              setTimeout(() => navigate('/project/list'), 1500);
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: usrName || '',
          email: usrEmail || ''
        },
        theme: {
          color: '#8B5CF6'
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Payment initiation failed');
    }
  };

  const plans = [
    {
      name: 'Basic',
      price: '₹100/month',
      features: [
        '5 Projects',
        'Up to 5 Users',
        'Add contributors',
        'Basic search',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Standard',
      price: '₹300/month',
      features: [
        '5 Projects',
        'Up to 5 Users',
        'Collaborative editing',
        'Advanced search',
        'Priority support',
        'Version history'
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: '₹600/month',
      features: [
        '5 Projects',
        '10 Users',
        'AI Chatbot + KB Source',
        'Custom domain',
        'SSO integration',
        '24/7 premium support',
        'Analytics dashboard'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-[Quicksand] text-gray-800">
      <style>{`
        .animate-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .pricing-card {
          opacity: 0;
          transform: translateY(30px);
        }
      `}</style>

      {/* Hero Section */}
      <section 
        className="flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f5f3ff, #e0e7ff)',
          borderRadius: '0 0 4rem 4rem',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <h1
          className="text-4xl md:text-6xl font-bold text-violet-700 mb-4 z-10"
          style={{ fontFamily: 'Kaushan Script' }}
        >
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto z-10">
          Choose the perfect plan for your team. All plans include core OnDoc features with monthly billing.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-6 -mt-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                ref={el => pricingRefs.current[index] = el}
                data-anim-type="burst"
                onMouseEnter={handleHover}
                className={`pricing-card rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'ring-4 ring-violet-400 scale-105' 
                    : 'bg-white'
                }`}
                style={{
                  boxShadow: plan.popular 
                    ? '0 20px 25px -5px rgba(139, 92, 246, 0.3), 0 10px 10px -5px rgba(139, 92, 246, 0.2)' 
                    : '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
                  background: plan.popular 
                    ? 'linear-gradient(135deg, #f0f9ff, #e0e7ff)' 
                    : 'white'
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-violet-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-violet-700 mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold mb-6 text-gray-800">{plan.price}</p>
                  
                  <ul className="text-left text-gray-600 space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg 
                          className="w-5 h-5 text-violet-500 mr-2 mt-0.5 flex-shrink-0" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleCheckout(plan.name.toLowerCase())}
                    onMouseEnter={handleHover}
                    className={`w-full font-semibold rounded-xl py-3 transition-all duration-300 ${
                      plan.popular
                        ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg'
                        : 'bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100'
                    }`}
                    style={{
                      boxShadow: plan.popular
                        ? '0 4px 6px -1px rgba(139, 92, 246, 0.3)'
                        : '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
                    }}
                  >
                    {plan.popular ? 'Get Started' : 'Choose Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra Info Section */}
      <section className="py-12 px-6 bg-violet-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="p-6 rounded-2xl bg-white"
              style={{
                boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
              }}
            >
              <div className="text-violet-600 text-2xl mb-2">🔄</div>
              <h3 className="font-bold text-lg mb-2">Flexible Billing</h3>
              <p className="text-gray-600">Monthly or annual billing. Cancel anytime.</p>
            </div>
            
            <div 
              className="p-6 rounded-2xl bg-white"
              style={{
                boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
              }}
            >
              <div className="text-violet-600 text-2xl mb-2">➕</div>
              <h3 className="font-bold text-lg mb-2">Extra Projects</h3>
              <p className="text-gray-600">Add projects at ₹150/month each.</p>
            </div>
            
            <div 
              className="p-6 rounded-2xl bg-white"
              style={{
                boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
              }}
            >
              <div className="text-violet-600 text-2xl mb-2">🌐</div>
              <h3 className="font-bold text-lg mb-2">Your Domain</h3>
              <p className="text-gray-600">Use our subdomain or connect your own.</p>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-white rounded-2xl max-w-2xl mx-auto" style={{
            boxShadow: '8px 8px 16px #e0e7ff, -8px -8px 16px #ffffff',
          }}>
            <h3 className="font-bold text-lg mb-3">Need something custom?</h3>
            <p className="text-gray-600 mb-4">
              For enterprise needs, custom integrations, or special requirements, 
              contact our sales team for a personalized solution.
            </p>
            <button
              ref={ctaRef}
              data-anim-type="ripple"
              onClick={handleClick}
              onMouseEnter={handleHover}
              className="inline-flex items-center bg-violet-50 text-violet-600 px-5 py-2.5 rounded-full font-medium"
              style={{
                boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
              }}
            >
              Contact Sales
              <svg 
                className="ml-2 w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;