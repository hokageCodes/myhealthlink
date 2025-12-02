'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState(null);

  // Full FAQs list - all questions displayed on this page
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
      answer: "Your data is protected with bank-level AES-256 encryption—the same standard used by financial institutions. We're HIPAA compliant and follow NDPR (Nigeria Data Protection Regulation) guidelines. Your data is encrypted both in transit and at rest, and only you control who can access it."
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
      answer: "Activate Emergency Mode to create a QR code that first responders can scan to instantly access your critical health information—blood type, allergies, emergency contacts, and current medications. This works even offline and doesn't require passwords."
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
      answer: "Absolutely. You have complete control over your data. You can delete individual documents, your entire health profile, or close your account at any time. When you delete data, it's permanently removed from our servers within 30 days."
    },
    {
      question: 'Does MyHealthLink work offline?',
      answer: "Your Emergency Mode QR code works offline—critical for emergencies. For full functionality like uploading documents and syncing across devices, you'll need an internet connection. We're working on enhanced offline capabilities for future updates."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold font-heading text-neutral-900 mb-6 mt-16"
            >
              Got questions?{' '}
              <span className="text-brand-600">We&apos;ve got answers</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto"
            >
              Everything you need to know about MyHealthLink. Can&apos;t find what you&apos;re looking for?{' '}
              <Link href="/contact" className="text-brand-600 hover:text-brand-700 font-semibold underline">
                Chat with our team
              </Link>
            </motion.p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="container mx-auto px-4 lg:px-6">

        {/* FAQs List with Scroll Animations */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-2xl border-2 border-neutral-200 hover:border-brand-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
              >
                <motion.button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left group"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors duration-200 pr-4">
                    {faq.question}
                  </span>
                  <motion.div 
                    className={`flex-shrink-0 w-10 h-10 rounded-full ${isOpen ? 'bg-brand-500' : 'bg-neutral-100'} flex items-center justify-center transition-all duration-300`}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isOpen ? (
                      <Minus className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-neutral-600 group-hover:text-brand-600" />
                    )}
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-neutral-600 leading-relaxed border-t border-neutral-200 pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white p-12 text-center rounded-3xl border-2 border-brand-200 shadow-xl">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl border border-brand-200">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold font-heading text-neutral-900 mb-2">
                    Ready to get started?
                  </h3>
                  <p className="text-neutral-600">
                    Join thousands of Nigerians organizing their health records with MyHealthLink.
                  </p>
                </div>
                <a
                  href="https://appetize.io/embed/b_chvduqipiukrpnyjxivd7dqwdi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 whitespace-nowrap"
                >
                  Start Free Today
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to Home Link */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
