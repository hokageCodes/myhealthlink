'use client';

import Link from 'next/link';
import {
  Heart,
  FileText,
  TrendingUp,
  Bell,
  Lock,
  QrCode,
  Download,
  Zap,
  Shield,
  Clock,
  Share2,
  Users,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturesPage() {
  // All features
  const features = [
    {
      icon: Heart,
      title: 'Complete Health Profile',
      description:
        'Store blood type, allergies, medications, and medical history in one secure digital vault.',
      color: 'text-brand-500',
      bgColor: 'bg-brand-50',
    },
    {
      icon: FileText,
      title: 'Smart Document Management',
      description:
        'Upload and auto-organize lab results, prescriptions, X-rays, and medical images by category.',
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      icon: TrendingUp,
      title: 'Health Tracking & Insights',
      description:
        'Monitor blood pressure, weight, glucose levels, and see your progress with beautiful trend charts.',
      color: 'text-success-500',
      bgColor: 'bg-success-100',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description:
        'Never miss medication times, health checks, or follow-up appointments with intelligent notifications.',
      color: 'text-warning-500',
      bgColor: 'bg-warning-100',
    },
    {
      icon: Lock,
      title: 'Granular Privacy Controls',
      description:
        'Choose exactly what information is visible when sharing—from full access to emergency-only mode.',
      color: 'text-brand-600',
      bgColor: 'bg-brand-100',
    },
    {
      icon: QrCode,
      title: 'Instant QR Code Access',
      description:
        'Generate secure QR codes for quick access to your health information — perfect for clinic visits.',
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    {
      icon: Download,
      title: 'Universal Data Export',
      description:
        'Download your complete health data as PDF reports or machine-readable JSON for any platform.',
      color: 'text-brand-500',
      bgColor: 'bg-brand-50',
    },
    {
      icon: Zap,
      title: 'Emergency Ready Mode',
      description:
        'Critical health information accessible to first responders even offline — your lifeline in emergencies.',
      color: 'text-danger-500',
      bgColor: 'bg-danger-100',
    },
    {
      icon: Clock,
      title: 'Save Time, Skip the Paper Chase',
      description:
        'No more digging through folders or hunting for lab results in WhatsApp chats. Everything you need is organized in one secure place.',
      color: 'text-brand-500',
      bgColor: 'bg-brand-50',
    },
    {
      icon: Share2,
      title: 'Share Instantly with One Link',
      description:
        'Generate a secure QR code or link to share your complete health profile with doctors, hospitals, or caregivers - in seconds, because your health matters',
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      icon: Shield,
      title: 'Emergency-Ready, Always',
      description:
        'In critical moments, responders can access your blood type, allergies, and emergency contacts instantly via your SECURE QR code or link.',
      color: 'text-danger-500',
      bgColor: 'bg-danger-100',
    },
    {
      icon: Users,
      title: 'Perfect for Everyone',
      description:
        "Whether you're managing chronic conditions, helping aging parents, or tracking your vitals, MyHealthLink adapts to your needs.",
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
  ];

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-br from-neutral-50 via-white to-brand-50 min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h1 className="mt-12 text-4xl lg:text-6xl font-bold font-heading text-neutral-900 mb-6">
            Everything you need for{' '}
            <span className="text-brand-600 relative">
              personalized health control
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-brand-300"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,8 Q150,0 300,8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
              </svg>
            </span>
          </h1>

          <p className="text-lg text-neutral-600 leading-relaxed">
            From basic record keeping to advanced health tracking—MyHealthLink
            has every tool you need to manage your health journey confidently.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`group p-8 rounded-2xl border-2 border-neutral-200 ${feature.bgColor} hover:border-brand-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-5 border-2 border-neutral-200 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold font-heading text-neutral-900 mb-3 group-hover:text-brand-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <section className="bg-white p-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl border border-brand-200">
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold font-heading text-neutral-900 mb-2">
                  Ready to take control?
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
          </section>
        </motion.div>

        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center text-brand-600 hover:text-brand-700 font-semibold transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to home
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

