import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-[Quicksand] text-gray-800">
      {/* Hero Section - Soft Violet Background with Neumorphic Inner Elements */}
      <section
        className="flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f5f3ff, #e0e7ff)',
          borderRadius: '0 0 4rem 4rem',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        {/* Optional subtle wave decoration */}
        {/* <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{
            background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 1440 320\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.3\' d=\'M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,213.3C960,224,1056,224,1152,202.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z\'%3E%3C/path%3E%3C/svg%3E") repeat-x',
            height: '60px',
            transform: 'scaleY(-1)',
            bottom: 0,
          }}
        ></div> */}

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
          your knowledgebase companion.
        </p>
        <a
          href="#"
          className="relative bg-violet-50 text-violet-600 border border-violet-200 px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          style={{
            boxShadow: '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff',
          }}
        >
          Get Started
        </a>
      </section>

      {/* Features Section - bg-violet-50 */}
      <section className="py-16 px-6 bg-violet-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: 'Kaushan Script' }}
          >
            Why OnDoc?
          </h2>
          <p className="text-gray-700 mb-12 max-w-3xl mx-auto">
            OnDoc empowers teams to build, maintain, and access internal knowledge with ease. It's fast, intuitive, and designed for efficiency.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: 'Smart Search', desc: 'Quickly find the information you need with intelligent search capabilities.' },
              { title: 'Real-time Collaboration', desc: 'Work together on documents in real-time with version history.' },
              { title: 'Custom Structure', desc: 'Organize your knowledge the way your team works best.' },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
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

      {/* How It Works - bg-white → changed to bg-violet-100 */}
      <section className="py-16 px-6 bg-violet-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl font-bold mb-8 text-gray-800"
            style={{ fontFamily: 'Kaushan Script' }}
          >
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { step: '1', title: 'Create & Import', desc: 'Start fresh or import existing docs in seconds.' },
              { step: '2', title: 'Organize & Tag', desc: 'Categorize your docs for easy access and smart suggestions.' },
              { step: '3', title: 'Share & Collaborate', desc: 'Invite your team to view, edit, and grow your knowledgebase.' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-violet-50 p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl"
                style={{
                  boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
                }}
              >
                <span
                  className="inline-block w-10 h-10 bg-violet-50 text-violet-600 font-bold text-xl text-center flex items-center justify-center rounded-full mx-auto mb-4"
                  style={{
                    boxShadow: 'inset 4px 4px 8px #e0e7ff, inset -4px -4px 8px #ffffff',
                  }}
                >
                  {item.step}
                </span>
                <h3
                  className="text-xl font-semibold mt-0 mb-1 text-violet-700"
                  style={{ fontFamily: 'Kaushan Script' }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - bg-violet-50 */}
      <section className="py-16 px-6 bg-violet-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: 'Kaushan Script' }}
          >
            Subscription Plans
          </h2>
          <p className="text-gray-700 mb-12 max-w-2xl mx-auto">
            Simple pricing with monthly renewal. Add extra projects anytime.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Basic',
                price: '₹100/month',
                features: ['5 Projects', 'Up to 5 Users', 'Add contributors'],
              },
              {
                name: 'Standard',
                price: '₹300/month',
                features: ['10 Projects', 'Up to 5 Users', 'Collaborative editing'],
              },
              {
                name: 'Premium',
                price: '₹600/month',
                features: ['12 Projects', '10 Users', 'AI Chatbot + KB Source'],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl"
                style={{
                  boxShadow: '10px 10px 20px #e0e7ff, -10px -10px 20px #ffffff',
                }}
              >
                <h3 className="text-2xl font-bold text-violet-700 mb-2">{plan.name}</h3>
                <p className="text-xl font-semibold mb-4">{plan.price}</p>
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full mr-2"></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="block text-center bg-violet-50 text-violet-600 border border-violet-200 px-4 py-2 rounded-full shadow-md hover:shadow-inner transition-all duration-300"
                  style={{
                    boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
                  }}
                >
                  Choose Plan
                </a>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-600">
            ₹150/month per extra project. Plans renew monthly. Use our subdomain or redirect to yours. Deploy as knowledge base or a static web site.
          </p>
        </div>
      </section>

      {/* Testimonials - bg-violet-100 */}
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
                quote: '“OnDoc transformed how our team shares knowledge. It’s clean, fast, and makes onboarding a breeze.”'
              },
              {
                name: 'Raj P.',
                quote: '“A truly modern internal wiki. The search function alone is a game-changer.”'
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-violet-50 p-6 rounded-2xl italic"
                style={{
                  boxShadow: '8px 8px 16px #e0e7ff, -8px -8px 16px #ffffff',
                }}
              >
                <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
                <span className="block font-semibold text-violet-700">{testimonial.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Soft Inset Violet Gradient with Neumorphic Button */}
      <section
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
            Join hundreds of teams using OnDoc to power their internal knowledge.
          </p>
          <a
            href="#"
            className="inline-block bg-violet-100 text-violet-700 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{
              boxShadow: '6px 6px 12px #e0e7ff, -6px -6px 12px #ffffff',
            }}
          >
            Start Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      {/* <footer
        className="w-full bg-violet-50 py-4 text-center text-sm text-gray-500 shadow-inner"
        style={{
          borderTop: '1px solid #ddd',
        }}
      >
        © {new Date().getFullYear()} OnDoc. All rights reserved.
      </footer> */}
    </div>
  );
};

export default Home;