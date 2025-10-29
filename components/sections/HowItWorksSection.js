'use client';

export default function HowItWorksSection({ showFeatures }) {
  if (!showFeatures) return null;

  return (
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
          <p className="text-gray-600">Share your health link or QR code with healthcare providers and emergency contacts.</p>
        </div>
      </div>
    </section>
  );
}

