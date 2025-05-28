import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Real-Time Drug Interactions",
      desc: "Integrated with openFDA databases for instant drug interaction checking to prevent adverse events",
      icon: "💊",
      stat: "Prevents 94% of potential interactions"
    },
    {
      title: "Digital Inclusion",
      desc: "Accessible to all patients regardless of technical literacy, ensuring everyone can benefit from digital healthcare",
      icon: "🔒",
      stat: "Increases access by 85%"
    },
    {
      title: "Seamless ePrescribing",
      desc: "Reduce medication errors by 72% with AI-assisted prescription workflows and verification",
      icon: "📋",
      stat: "Saves 4.5 hours per clinician weekly"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Clinical-Grade Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
              </div>
              <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              UmodziRx<span className="text-blue-600"></span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/Learn" className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center">
                Features
              </Link>
              <Link to="/contact" className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center">
                Contact Us
              </Link>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 bg-white rounded-xl shadow-xl border border-gray-100">
              <div className="flex flex-col space-y-3 px-2">
                <Link 
                  to="/Learn" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Features
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg bg-blue-600 text-white text-center font-medium shadow-md flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Us
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow pt-24">
        {/* Clinical Hero */}
        <section className="relative">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-white"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="grid md:grid-cols-12 gap-4 md:gap-6 items-center">
              {/* Text content */}
              <div className="md:col-span-5 space-y-6">
                {/* <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  HIPAA Compliant
                </div> */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="block text-blue-600">Secure Prescription Management with</span>
                  <span className="block">UmodziRx</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg">
                  Leveraging Digital ID for secure and efficient prescription management.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link to="/Login" className="w-full sm:w-auto">
                    <button className="w-full px-8 py-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center justify-center">
                      Get Started
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </Link>
                  <Link to="/Learn" className="w-full sm:w-auto">
                    <button className="w-full px-8 py-4 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-all flex items-center justify-center">
                      See Features
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Image container */}
              <div className="md:col-span-7 relative">
                {/* Subtle left-to-right gradient overlay to blend with text */}
                <div className="absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-blue-50/90 to-transparent"></div>
                
                {/* Main image container with simplified styling */}
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  <img 
                    //src="https://placehold.co/800x500/e6f7ff/0099cc?text=UmodziRx+Dashboard" 
                    src="/images/UmodziRxDashboard.jpg" // Replace this with actual image source path
                    alt="UmodziRx EHR dashboard showing prescription management"
                    className="w-full h-auto"
                    loading="eager"
                  />
                  
                  {/* Subtle overlay to soften the image */}
                  <div className="absolute inset-0 bg-white/5"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Carousel */}
        <section className="bg-gray-50 py-8 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Key Features</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                
              </p>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={`p-6 rounded-xl transition-all duration-300 ${activeFeature === index ? 'bg-white shadow-lg border border-blue-100 transform scale-105' : 'bg-gray-50 shadow-md hover:shadow-lg'}`}
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.desc}</p>
                    <p className="text-sm font-medium text-blue-600">{feature.stat}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8 space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all ${activeFeature === index ? 'bg-blue-600 w-6' : 'bg-gray-300'}`}
                    aria-label={`Go to feature ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EHR Integration */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">What is a Digital ID?</h2>
                <p className="text-lg text-gray-600 mb-8">
                  A Digital ID is an electronic version of a person’s identity that can be used to verify who they are online, or in digital systems. This helps us:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Foster digital inclusion, allowing patients to easily access their health information.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Maintain medical history and ensure continuity of care.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Tie users to prescription lifecycles, mitigating fraud.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <img 
                  src="https://placehold.co/600x400/e6f7ff/0099cc?text=Digital+ID+Concept" 
                  // src="/images/digital-id-concept.jpg" // Replace this with actual image source path
                  alt="Diagram illustrating digital ID, e.g. hand holding out a digital profile" 
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">Ready to Transform Your Medication Workflow?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Reach out to us!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="w-full sm:w-auto">
                <button className="w-full px-8 py-4 rounded-lg border-2 border-white text-white font-bold hover:bg-blue-800 transition-all">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <ul className="space-y-2">
                <li><Link to="/learn" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <p className="text-sm text-gray-400">UmodziRx {new Date().getFullYear()}.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}