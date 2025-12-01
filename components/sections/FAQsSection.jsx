'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'What is MyHealthLink?',
      answer: 'MyHealthLink is a secure, mobile-first platform that lets you store, organize, and share all your medical records through a single link or QR code. Think of it as your personal health data vault—accessible anytime, anywhere.'
    },
    {
      question: 'Is MyHealthLink free to use?',
      answer: 'Yes! MyHealthLink is completely free for individuals. You can store unlimited medical records, generate QR codes, and share your health profile at no cost. We believe everyone deserves easy access to their health information.'
    },
    {
      question: 'How secure is my health data?',
      answer: 'Your data is protected with bank-level AES-256 encryption—the same standard used by financial institutions. We\'re HIPAA compliant and follow NDPR (Nigeria Data Protection Regulation) guidelines. Your data is encrypted both in transit and at rest, and only you control who can access it.'
    },
    {
      question: 'Who can see my medical records?',
      answer: 'Only you decide who sees your records. You can share your health profile via secure links with customizable access controls—set passwords, expiration dates, or create emergency-only views that show just critical information like blood type and allergies.'
    },
    {
      question: 'How do I share my records with my doctor?',
      answer: 'Simply generate a secure link or QR code from your dashboard and share it via WhatsApp, email, or SMS. Your doctor can access your complete health history instantly—no sign-up required on their end. You can also set the link to expire after a certain time for added security.'
    },
    {
      question: 'What happens in an emergency?',
      answer: 'Activate Emergency Mode to create a QR code that first responders can scan to instantly access your critical health information—blood type, allergies, emergency contacts, and current medications. This works even offline and doesn\'t require passwords.'
    },
    {
      question: 'What types of documents can I upload?',
      answer: 'You can upload any health-related document—lab results, X-rays, MRI scans, prescriptions, vaccination records, discharge summaries, and more. We support PDF, JPG, PNG, and DICOM formats. Our smart system automatically categorizes your documents for easy access.'
    },
    {
      question: 'Can I track my health metrics over time?',
      answer: 'Yes! Log vital signs like blood pressure, glucose levels, weight, and temperature. MyHealthLink creates beautiful trend charts so you can visualize your health journey and share progress reports with your healthcare team.'
    },
    {
      question: 'Do I need to download an app?',
      answer: 'No download needed! MyHealthLink works directly in your web browser on any device—phone, tablet, or computer. Just visit our website, sign up, and start organizing your health records instantly.'
    },
    {
      question: 'Can family members help manage my health records?',
      answer: 'Yes! You can grant trusted family members access to view or manage your health profile. This is especially useful for elderly parents, children, or anyone who needs help organizing their medical information.'
    },
    {
      question: 'Can I delete my data?',
      answer: 'Absolutely. You have complete control over your data. You can delete individual documents, your entire health profile, or close your account at any time. When you delete data, it\'s permanently removed from our servers within 30 days.'
    },
    {
      question: 'Does MyHealthLink work offline?',
      answer: 'Your Emergency Mode QR code works offline—critical for emergencies. For full functionality like uploading documents and syncing across devices, you\'ll need an internet connection. We\'re working on enhanced offline capabilities for future updates.'
    }
  ];

  return (
    <section id="faqs" className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          
          <h2 className="text-4xl lg:text-5xl font-bold font-heading text-neutral-900 mb-6">
            Got questions?{' '}
            <span className="text-brand-600">We have the answers</span>
          </h2>
          
          <p className="text-lg text-neutral-600 leading-relaxed">
            Everything you need to know about MyHealthLink. Can't find what you're looking for?{' '}
            <a href="/contact" className="text-brand-600 hover:text-brand-700 font-semibold underline">
              Chat with our team
            </a>
          </p>
        </div>

        {/* FAQ Items (show only first 3) */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.slice(0, 3).map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-neutral-200 hover:border-brand-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left group"
                >
                  <span className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors duration-200 pr-4">
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${isOpen ? 'bg-brand-500' : 'bg-neutral-100'} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                    {isOpen ? (
                      <Minus className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-neutral-600 group-hover:text-brand-600" />
                    )}
                  </div>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top duration-200">
                    <p className="text-neutral-600 leading-relaxed border-t border-neutral-200 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View all FAQs CTA */}
        <div className="mt-12 text-center">
          <a
            href="/faqs"
            className="inline-flex items-center justify-center px-8 py-3 text-brand-600 border-2 border-brand-200 hover:border-brand-500 hover:text-brand-700 bg-white rounded-full text-base font-medium transition-all duration-300 hover:shadow-lg"
          >
            View All FAQs
          </a>
        </div>

          
      </div>
    </section>
  );
}