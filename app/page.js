'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Shield, Smartphone, Users, ArrowRight, Check } from 'lucide-react';

export default function Home() {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MyHealthLink</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="btn btn-primary rounded-full px-6"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            One Link for Your{' '}
            <span className="text-blue-600">Health</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Store, organize, and share your health information securely. 
            Never lose your medical records again with our mobile-first platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/register" 
              className="btn btn-primary text-lg px-8 py-4 rounded-full"
            >
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button 
              onClick={() => setShowFeatures(!showFeatures)}
              className="btn btn-outline text-lg px-8 py-4 rounded-full"
            >
              See How It Works
            </button>
          </div>

          {/* Demo QR Code Placeholder */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-auto">
            <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-500">QR Code Demo</span>
            </div>
            <p className="text-sm text-gray-600">Scan to view health profile</p>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose MyHealthLink?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built specifically for Nigerian healthcare needs with security and accessibility in mind.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Mobile-First Design</h3>
            <p className="text-gray-600">
              Access your health records anywhere, anytime. Works perfectly on any device with offline viewing for emergencies.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Secure & Private</h3>
            <p className="text-gray-600">
              Your data is encrypted and stored securely. You control what information is shared and with whom.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Easy Sharing</h3>
            <p className="text-gray-600">
              Share your complete health profile with doctors, emergency contacts, or family members via a single link or QR code.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      {showFeatures && (
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account with basic information and verify your email/phone.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Build Profile</h3>
              <p className="text-gray-600">Add your medical information, medications, and upload important documents.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Health</h3>
              <p className="text-gray-600">Monitor your health metrics and set reminders for medications and checkups.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Share & Access</h3>
              <p className="text-gray-600">Share your health link or QR code with doctors and emergency contacts.</p>
            </div>
          </div>
        </section>
      )}

      {/* Features List */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for Your Health
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Complete Health Profile</h3>
                  <p className="text-gray-600">Store blood type, allergies, medications, and medical history.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Document Management</h3>
                  <p className="text-gray-600">Upload and organize lab results, prescriptions, and medical images.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Health Tracking</h3>
                  <p className="text-gray-600">Monitor blood pressure, weight, glucose levels, and medication adherence.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Reminders</h3>
                  <p className="text-gray-600">Get notified for medication times, health checks, and appointments.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Privacy Controls</h3>
                  <p className="text-gray-600">Control what information is visible when sharing your profile.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">QR Code Access</h3>
                  <p className="text-gray-600">Generate QR codes for quick access to your health information.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Data Export</h3>
                  <p className="text-gray-600">Download your complete health data as PDF or JSON format.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Emergency Ready</h3>
                  <p className="text-gray-600">Critical health information accessible even without internet connection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Nigerians who trust MyHealthLink with their health information.
          </p>
          <Link 
            href="/register" 
            className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-full inline-flex items-center"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">MyHealthLink</span>
              </div>
              <p className="text-gray-400">
                One Link for Your Health
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Security</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MyHealthLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}