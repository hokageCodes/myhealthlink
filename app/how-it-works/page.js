'use client';

import Link from 'next/link';
import {
  UserPlus,
  FileText,
  TrendingUp,
  Share2,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Shield,
  QrCode,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Sign Up & Create Your Profile',
      description:
        'Get started in seconds. Create your account with basic information and verify your email or phone number. Your data is encrypted from day one.',
      details: [
        'Quick registration process',
        'Email or phone verification',
        'Secure account setup',
      ],
      color: 'text-brand-500',
      bgColor: 'bg-brand-50',
      borderColor: 'border-brand-200',
    },
    {
      number: '02',
      icon: FileText,
      title: 'Build Your Health Profile',
      description:
        'Add your medical information, medications, allergies, and upload important documents. Our smart system automatically organizes everything for easy access.',
      details: [
        'Add medical history',
        'Upload documents (lab results, X-rays, prescriptions)',
        'Set up medications and allergies',
      ],
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
      borderColor: 'border-accent-200',
    },
    {
      number: '03',
      icon: TrendingUp,
      title: 'Track Your Health Metrics',
      description:
        'Monitor your vital signs over time. Log blood pressure, glucose levels, weight, and more. Visualize your progress with beautiful trend charts.',
      details: [
        'Log health metrics daily',
        'View progress charts',
        'Set medication reminders',
      ],
      color: 'text-success-500',
      bgColor: 'bg-success-100',
      borderColor: 'border-success-300',
    },
    {
      number: '04',
      icon: Share2,
      title: 'Share & Access Anytime',
      description:
        'Generate a secure link or QR code to share with healthcare providers, family members, or emergency contacts. Control who sees what with granular privacy settings.',
      details: [
        'Generate secure QR codes',
        'Share via link, WhatsApp, or email',
        'Set access permissions',
      ],
      color: 'text-brand-600',
      bgColor: 'bg-brand-100',
      borderColor: 'border-brand-300',
    },
  ];

  const benefits = [
    {
      icon: Smartphone,
      title: 'Mobile-First',
      description: 'Access your health records from any device, anywhere.',
      color: 'text-brand-500',
      bgColor: 'bg-brand-50',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted with AES-256 encryption.',
      color: 'text-success-500',
      bgColor: 'bg-success-100',
    },
    {
      icon: QrCode,
      title: 'Instant Access',
      description: 'Share your health profile in seconds with QR codes.',
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
  ];

  // Image mapping for each step
  const stepImages = [
    '/profile.png', // Step 1: Sign Up
    '/Group.png',   // Step 2: Build Profile
    '/center.png',  // Step 3: Track Health
    '/code.png',    // Step 4: Share & Access
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center mt-16">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold font-heading text-neutral-900 mb-6"
            >
              How MyHealthLink{' '}
              <span className="text-brand-600">Works</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto"
            >
              Get started in minutes. Manage your health records, share with doctors, and stay in control—all from one secure platform.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-8 lg:py-12 relative bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-16 lg:space-y-24">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
                      isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-16 h-16 ${step.bgColor} ${step.borderColor} border-2 rounded-2xl flex items-center justify-center`}
                        >
                          <Icon className={`w-8 h-8 ${step.color}`} />
                        </div>
                        <span className="text-4xl font-bold text-neutral-300">
                          {step.number}
                        </span>
                      </div>

                      <h2 className="text-3xl lg:text-4xl font-bold font-heading text-neutral-900 mb-4">
                        {step.title}
                      </h2>

                      <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                        {step.description}
                      </p>

                      <ul className="space-y-3">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                            <span className="text-neutral-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Image */}
                    <div className="flex-1">
                      <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                        <Image
                          src={stepImages[index]}
                          alt={step.title}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold font-heading text-neutral-900 mb-4">
              Why Choose MyHealthLink?
            </h2>
            <p className="text-lg text-neutral-600">
              Built with your privacy and convenience in mind
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white border-2 border-neutral-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div
                    className={`w-14 h-14 ${benefit.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className={`w-7 h-7 ${benefit.color}`} />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-neutral-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20">
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

