import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LearnMore() {
  const [activeTab, setActiveTab] = useState('features');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component mounts
    
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
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
              <Link to="/learn" className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center">
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
                  className="px-4 py-3 rounded-lg hover:bg-blue-50 text-blue-600 font-medium flex items-center"
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

      {/* Main Content */}
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center">
              {/* <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                HIPAA Compliant
              </div> */}
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                <span className="block text-blue-600">UmodziRx Features</span>
                <span className="block">Blockchain Digital ID Prescription System</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Revolutionizing Prescription Management Through Secure Digital Identity
              </p>
            </div>
          </div>
        </section>

        {/* Tabs for navigation between sections */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center overflow-x-auto pb-1">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('features')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'features'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Key Features
                </button>
                <button
                  onClick={() => setActiveTab('patients')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'patients'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  For Patients
                </button>
                <button
                  onClick={() => setActiveTab('providers')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'providers'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  For Healthcare Providers
                </button>
                <button
                  onClick={() => setActiveTab('technology')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'technology'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Technology
                </button>
              </nav>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Features Tab Content */}
            {activeTab === 'features' && (
              <div className="space-y-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Key Features of UmodziRx</h2>
                  <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                    Our platform offers cutting-edge technology to ensure secure and efficient prescription management
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <div className="text-blue-600 text-4xl mb-4">💊</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Drug Interactions</h3>
                    <p className="text-gray-600 mb-4">Integrated with openFDA databases for instant drug interaction checking to prevent adverse events.</p>
                    <p className="text-sm font-medium text-blue-600">Prevents 94% of potential interactions</p>
                  </div>
                  
                  <div className="p-6 bg-green-50 rounded-xl">
                    <div className="text-green-600 text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Digital ID</h3>
                    <p className="text-gray-600 mb-4">Blockchain-powered digital identity system ensures tamper-proof prescription records and authentication.</p>
                    <p className="text-sm font-medium text-green-600">Military-grade security protocols</p>
                  </div>
                  
                  <div className="p-6 bg-purple-50 rounded-xl">
                    <div className="text-purple-600 text-4xl mb-4">📋</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Seamless ePrescribing</h3>
                    <p className="text-gray-600 mb-4">Reduce medication errors with AI-assisted prescription workflows and verification.</p>
                    <p className="text-sm font-medium text-purple-600">Saves 4.5 hours per clinician weekly</p>
                  </div>
                  
                  <div className="p-6 bg-yellow-50 rounded-xl">
                    <div className="text-yellow-600 text-4xl mb-4">🌍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Digital Inclusion</h3>
                    <p className="text-gray-600 mb-4">Accessible to all patients regardless of technical literacy, ensuring everyone can benefit from digital healthcare.</p>
                    <p className="text-sm font-medium text-yellow-600">Increases access by 85%</p>
                  </div>
                  
                  <div className="p-6 bg-red-50 rounded-xl">
                    <div className="text-red-600 text-4xl mb-4">⚡</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Tracking</h3>
                    <p className="text-gray-600 mb-4">Monitor prescription status from prescribing to dispensing with real-time updates and notifications.</p>
                    <p className="text-sm font-medium text-red-600">100% visibility throughout lifecycle</p>
                  </div>
                  
                  <div className="p-6 bg-indigo-50 rounded-xl">
                    <div className="text-indigo-600 text-4xl mb-4">🔄</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Interoperability</h3>
                    <p className="text-gray-600 mb-4">Seamlessly integrates with existing healthcare systems and EHRs through standard APIs and protocols.</p>
                    <p className="text-sm font-medium text-indigo-600">Compatible with 95% of EHR systems</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Patients Tab Content */}
            {activeTab === 'patients' && (
              <div className="space-y-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Benefits for Patients</h2>
                  <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                    UmodziRx empowers patients with secure access to their prescription information
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img 
                      src="https://placehold.co/800x500/e6f7ff/0099cc?text=Patient+Mobile+Access" 
                      alt="Patient accessing prescriptions on mobile device"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Digital Access</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">Access complete prescription history anytime, anywhere</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">Receive medication reminders and refill notifications</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">Share medical information securely with healthcare providers</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img 
                      src="https://placehold.co/800x500/e6f7ff/0099cc?text=Patient+Security" 
                      alt="Secure patient data visualization"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Enhanced Security & Control</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">Reduced risk of prescription fraud through biometric verification</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">Full control over who can access your health information</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">Privacy-preserving technology that protects sensitive data</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-8 mt-12">
                  <div className="max-w-3xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient Testimonial</h3>
                    <blockquote className="text-xl italic text-gray-700 mb-4">
                      "UmodziRx has completely transformed how I manage my medications. I no longer worry about losing paper prescriptions or forgetting refills. Everything is securely stored and accessible whenever I need it."
                    </blockquote>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">MK</div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">Maria K.</p>
                        <p className="text-gray-600">Patient</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Healthcare Providers Tab Content */}
            {activeTab === 'providers' && (
              <div className="space-y-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Benefits for Healthcare Providers</h2>
                  <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                    UmodziRx streamlines workflows and enhances patient care for healthcare professionals
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Time Savings</h3>
                    <p className="text-gray-600">Automated workflows reduce administrative tasks, giving clinicians more time with patients.</p>
                    <p className="mt-4 text-sm font-medium text-blue-600">Saves 4.5 hours per clinician weekly</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="bg-green-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Improved Safety</h3>
                    <p className="text-gray-600">Real-time drug interaction alerts and verification processes reduce medication errors.</p>
                    <p className="mt-4 text-sm font-medium text-green-600">Reduces errors by 72%</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="bg-purple-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Data Insights</h3>
                    <p className="text-gray-600">Access to comprehensive patient medication history and analytics for better clinical decision-making.</p>
                    <p className="mt-4 text-sm font-medium text-purple-600">Complete medication history visibility</p>
                  </div>
                </div>
                
                <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-12">
                  <div className="grid md:grid-cols-2">
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Streamlined Workflow</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-3 px-2.5 py-0.5 rounded-full flex-shrink-0">1</span>
                          <div>
                            <h4 className="font-medium text-gray-900">Secure Authentication</h4>
                            <p className="text-gray-600">Quick login with biometric verification</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-3 px-2.5 py-0.5 rounded-full flex-shrink-0">2</span>
                          <div>
                            <h4 className="font-medium text-gray-900">Digital Prescribing</h4>
                            <p className="text-gray-600">Create and send prescriptions with automated safety checks</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-3 px-2.5 py-0.5 rounded-full flex-shrink-0">3</span>
                          <div>
                            <h4 className="font-medium text-gray-900">Blockchain Verification</h4>
                            <p className="text-gray-600">Tamper-proof recording of prescription events</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-3 px-2.5 py-0.5 rounded-full flex-shrink-0">4</span>
                          <div>
                            <h4 className="font-medium text-gray-900">Real-time Tracking</h4>
                            <p className="text-gray-600">Monitor prescription status through fulfillment</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-600">
                      <img 
                        src="https://placehold.co/800x500/0066cc/ffffff?text=Provider+Workflow" 
                        alt="Healthcare provider workflow diagram"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Technology Tab Content */}
            {activeTab === 'technology' && (
              <div className="space-y-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Our Technology</h2>
                  <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                    UmodziRx leverages cutting-edge technology for secure and efficient prescription management
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Blockchain Digital ID</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      Our platform is built on a secure blockchain foundation that ensures tamper-proof prescription records and verification. Every transaction is cryptographically secured and immutable.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <svg className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Decentralized architecture for enhanced security</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Private permissioned ledger for healthcare compliance</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Smart contracts automate verification and compliance</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative">
                    <img 
                      src="https://placehold.co/800x500/e6f7ff/0099cc?text=Blockchain+Architecture" 
                      alt="Blockchain technology diagram"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent rounded-lg"></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-8 rounded-xl mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Security & Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="text-blue-600 text-xl font-bold mb-2">HIPAA</div>
                      <p className="text-gray-600">Fully compliant with healthcare privacy regulations</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="text-blue-600 text-xl font-bold mb-2">End-to-End Encryption</div>
                      <p className="text-gray-600">All data is encrypted in transit and at rest</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="text-blue-600 text-xl font-bold mb-2">Biometric Authentication</div>
                      <p className="text-gray-600">Multi-factor authentication with biometric verification</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <div className="text-blue-600 text-xl font-bold mb-2">Regular Audits</div>
                      <p className="text-gray-600">Continuous security monitoring and testing</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">Ready to Transform Your Medication Workflow?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Experience the future of secure prescription management with UmodziRx
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-lg">
                Contact Our Team
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
