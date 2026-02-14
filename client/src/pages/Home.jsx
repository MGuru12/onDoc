import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Added for navigation

const Home = () => {
  const heroRef = useRef(null);
  const featureRefs = useRef([]);
  const stepRefs = useRef([]);
  const pricingRefs = useRef([]);
  const testimonialRefs = useRef([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Dynamically load mo.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mojs/core';
    script.async = true;
    script.onload = () => {
      initAnimations();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initAnimations = () => {
    if (!window.mojs) return;

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Trigger mo.js animation based on element type
          const animType = entry.target.dataset.animType;
          if (animType === 'burst') {
            createBurstAnimation(entry.target);
          } else if (animType === 'ripple') {
            createRippleAnimation(entry.target);
          } else if (animType === 'shape') {
            createShapeAnimation(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe all animated elements
    [heroRef.current, ...featureRefs.current, ...stepRefs.current, 
     ...pricingRefs.current, ...testimonialRefs.current, ctaRef.current]
      .filter(Boolean)
      .forEach(el => observer.observe(el));

    // Hero title burst on load
    if (heroRef.current) {
      setTimeout(() => createHeroBurst(heroRef.current), 300);
    }
  };

  const createHeroBurst = (element) => {
    if (!window.mojs) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    new window.mojs.Burst({
      left: centerX,
      top: centerY,
      radius: { 0: 150 },
      count: 12,
      children: {
        shape: 'circle',
        radius: { 8: 0 },
        fill: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
        duration: 1200,
        easing: 'cubic.out'
      }
    }).play();
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
        fill: '#8b5cf6',
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

  const createShapeAnimation = (element) => {
    if (!window.mojs) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    new window.mojs.Shape({
      left: centerX,
      top: centerY,
      shape: 'polygon',
      radius: { 0: 60 },
      fill: 'none',
      stroke: '#a78bfa',
      strokeWidth: { 4: 0 },
      angle: { 0: 180 },
      duration: 1200,
      easing: 'elastic.out'
    }).play();
  };

  const handleHover = (e) => {
    if (!window.mojs) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
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

  const handleFocus = (e) => {
    if (!window.mojs) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    new window.mojs.Shape({
      left: centerX,
      top: centerY,
      shape: 'circle',
      radius: { 0: 80 },
      fill: 'none',
      stroke: '#8b5cf6',
      strokeWidth: { 2: 0 },
      opacity: { 0.8: 0 },
      duration: 800,
      easing: 'cubic.out'
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
        
        .feature-card, .step-card, .pricing-card, .testimonial-card {
          opacity: 0;
          transform: translateY(30px);
        }
      `}</style>

      {/* Hero Section */}
      <section
        ref={heroRef}
        data-anim-type="burst"
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
          OnDoc
        </h1>
        <p
          className="text-lg md:text-2xl text-gray-600 mb-8 z-10"
          style={{ fontFamily: 'Kaushan Script' }}
        >
          Your knowledgebase companion for internal & external documentation.
        </p>
        <Link
          to="/auth/registration"
          onClick={handleClick}
          onMouseEnter={handleHover}
          onFocus={handleFocus}
          className="relative bg-violet-50 text-violet-600 border border-violet-200 px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          style={{
            boxShadow: '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff',
          }}
        >
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-violet-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: 'Kaushan Script' }}
          >
            Why OnDoc?
          </h2>
          <p className="text-gray-700 mb-12 max-w-3xl mx-auto">
            OnDoc empowers teams to build, maintain, and access both internal and external knowledgebases with ease. It's fast, intuitive, and designed for efficiency.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: 'Dual Knowledgebases', desc: 'Manage separate internal and external documentation spaces with unified search.' },
              { title: 'Real-time Collaboration', desc: 'Work together on documents in real-time with version history.' },
              { title: 'Custom Structure', desc: 'Organize your knowledge the way your team works best for both audiences.' },
            ].map((feature, index) => (
              <div
                key={index}
                ref={el => featureRefs.current[index] = el}
                data-anim-type="ripple"
                onMouseEnter={handleHover}
                className="feature-card bg-white p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
                }}
              >
                <h3
                  className="text-xl font-semibold mb-2 text-violet-600"
                  style={{ fontFamily: 'Kaushan Script' }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-violet-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl font-bold mb-8 text-gray-800"
            style={{ fontFamily: 'Kaushan Script' }}
          >
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create & Import', desc: 'Start fresh or import existing docs for both internal and external use.' },
              { step: '2', title: 'Organize & Tag', desc: 'Categorize your docs with audience-specific permissions and smart suggestions.' },
              { step: '3', title: 'Share & Collaborate', desc: 'Invite your team to view/edit internal docs and publish external docs instantly.' },
            ].map((item, index) => (
              <div
                key={index}
                ref={el => stepRefs.current[index] = el}
                data-anim-type="shape"
                onMouseEnter={handleHover}
                className="step-card bg-violet-50 p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl"
                style={{
                  boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
                }}
              >
                <span
                  className="inline-block w-10 h-10 bg-violet-50 text-violet-600 font-bold text-xl flex items-center justify-center rounded-full mb-4"
                  style={{
                    boxShadow: 'inset 4px 4px 8px #e0e7ff, inset -4px -4px 8px #ffffff',
                  }}
                >
                  {item.step}
                </span>
                <h3
                  className="text-xl font-semibold mt-0 mb-2 text-violet-700"
                  style={{ fontFamily: 'Kaushan Script' }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-6 bg-violet-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: 'Kaushan Script' }}
          >
            Subscription Plans
          </h2>
          <p className="text-gray-700 mb-12 max-w-2xl mx-auto">
            All plans include both internal and external knowledgebases. Simple pricing with monthly renewal.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Basic',
                price: '₹100/month',
                features: ['5 Projects', 'Up to 5 Users', 'Internal + External KB', 'Add contributors'],
              },
              {
                name: 'Standard',
                price: '₹300/month',
                features: ['5 Projects', 'Up to 5 Users', 'Internal + External KB', 'Collaborative editing'],
              },
              {
                name: 'Premium',
                price: '₹600/month',
                features: ['5 Projects', '10 Users', 'Internal + External KB', 'AI Chatbot + KB Source'],
              },
            ].map((plan, index) => (
              <div
                key={index}
                ref={el => pricingRefs.current[index] = el}
                data-anim-type="burst"
                onMouseEnter={handleHover}
                className="pricing-card bg-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl"
                style={{
                  boxShadow: '10px 10px 20px #e0e7ff, -10px -10px 20px #ffffff',
                }}
              >
                <h3 className="text-2xl font-bold text-violet-700 mb-2">{plan.name}</h3>
                <p className="text-xl font-semibold mb-4">{plan.price}</p>
                <ul className="text-left text-gray-600 space-y-2 mb-6 pl-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {/* Removed "Choose Plan" button */}
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-600">
            ₹150/month per extra project. Plans renew monthly. Use our subdomain or redirect to yours. Deploy as knowledge base or a static web site.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-violet-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-gray-800 mb-8"
            style={{ fontFamily: 'Kaushan Script' }}
          >
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Emily T.',
                quote: 'OnDoc transformed how our team shares knowledge. The dual KB system lets us keep internal docs private while publishing clean external docs.'
              },
              {
                name: 'Raj P.',
                quote: 'A truly modern documentation platform. Managing both customer-facing and internal docs in one place is a game-changer.'
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                ref={el => testimonialRefs.current[index] = el}
                data-anim-type="ripple"
                onMouseEnter={handleHover}
                className="testimonial-card bg-violet-50 p-6 rounded-2xl"
                style={{
                  boxShadow: '8px 8px 16px #e0e7ff, -8px -8px 16px #ffffff',
                }}
              >
                <p className="text-gray-700 mb-4 italic text-left leading-relaxed">{testimonial.quote}</p>
                <span className="block font-semibold text-violet-700 text-right">{testimonial.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        ref={ctaRef}
        data-anim-type="burst"
        className="py-20 text-center px-6 relative"
        style={{
          background: 'linear-gradient(135deg, #c7d2fe, #a5b4fc)',
          borderRadius: '3rem 3rem 0 0',
          color: '#fff',
        }}
      >
        <div
          className="absolute inset-0 rounded-t-[3rem] opacity-20"
          style={{
            boxShadow: 'inset 10px 10px 30px #7c3aed, inset -10px -10px 30px #e0e7ff',
            borderRadius: '3rem 3rem 0 0',
          }}
        ></div>

        <div className="relative z-10">
          <h2
            className="text-3xl font-bold mb-4 text-violet-800"
            style={{ fontFamily: 'Kaushan Script' }}
          >
            Ready to Get Started?
          </h2>
          <p className="mb-6 text-lg text-violet-900">
            Join hundreds of teams using OnDoc to power their internal and external knowledgebases.
          </p>
          <Link
            to="/auth/registration"
            onClick={handleClick}
            onMouseEnter={handleHover}
            onFocus={handleFocus}
            className="inline-block bg-violet-100 text-violet-700 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{
              boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
            }}
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;