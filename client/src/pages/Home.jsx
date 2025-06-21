import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center bg-white">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-700 mb-4">
          OnDoc
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-8">
          your knowledgebase companion.
        </p>
        <a
          href="#"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg transition"
        >
          Get Started
        </a>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Why OnDoc?</h2>
          <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
            OnDoc empowers teams to build, maintain, and access internal knowledge with ease. It's fast, intuitive, and designed for efficiency.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: 'Smart Search', desc: 'Quickly find the information you need with intelligent search capabilities.' },
              { title: 'Real-time Collaboration', desc: 'Work together on documents in real-time with version history.' },
              { title: 'Custom Structure', desc: 'Organize your knowledge the way your team works best.' },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2 text-blue-600">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { step: '1', title: 'Create & Import', desc: 'Start fresh or import existing docs in seconds.' },
              { step: '2', title: 'Organize & Tag', desc: 'Categorize your docs for easy access and smart suggestions.' },
              { step: '3', title: 'Share & Collaborate', desc: 'Invite your team to view, edit, and grow your knowledgebase.' },
            ].map((item, index) => (
              <div key={index} className="p-6 border rounded-lg hover:shadow-md transition">
                <span className="text-blue-600 font-bold text-2xl">{item.step}</span>
                <h3 className="text-xl font-semibold mt-2 mb-1">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">What Our Users Say</h2>
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
              <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <span className="block font-semibold text-blue-700">{testimonial.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600 text-white text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="mb-6 text-lg">Join hundreds of teams using OnDoc to power their internal knowledge.</p>
        <a
          href="#"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
        >
          Start Free Trial
        </a>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white shadow-inner py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} OnDoc. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
