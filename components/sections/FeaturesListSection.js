'use client';

import {
  Check,
  Heart,
  FileText,
  TrendingUp,
  Bell,
  Lock,
  QrCode,
  Download,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function FeaturesListSection() {
  const allFeatures = [
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
  ];

  // Show only first 4 features
  const displayedFeatures = allFeatures.slice(0, 4);
  const leftFeatures = displayedFeatures.slice(0, 2);
  const rightFeatures = displayedFeatures.slice(2, 4);

  return (
    <section id="features-list" className="relative py-12 lg:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 relative">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-semibold font-heading text-neutral-900 mb-6">
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
          </h2>

          <p className="text-lg text-neutral-600 leading-relaxed">
            From basic record keeping to advanced health tracking—MyHealthLink
            has every tool you need to manage your health journey confidently.
          </p>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:gap-12 items-start lg:grid-cols-[1fr_auto_1fr]">
            {/* Left column - 2 features */}
            <div className="space-y-4">
              {leftFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group flex items-start space-x-4 p-5 bg-white rounded-2xl border border-neutral-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className={`flex-shrink-0 w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-neutral-900 mb-1 group-hover:text-brand-600 transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <Check className="flex-shrink-0 w-5 h-5 text-success-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                );
              })}
            </div>

            {/* Center - Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative mx-auto max-w-sm lg:sticky lg:top-24">
                {/* Phone Frame */}
                <Image src="/center.png" alt="Feature 1" width={1400} height={1200} />
              </div>
            </div>

            {/* Right column - 2 features */}
            <div className="space-y-4">
              {rightFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group flex items-start space-x-4 p-5 bg-white rounded-2xl border border-neutral-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className={`flex-shrink-0 w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-neutral-900 mb-1 group-hover:text-brand-600 transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <Check className="flex-shrink-0 w-5 h-5 text-success-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* View All Features CTA */}
          <div className="text-center mt-12">
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-3 text-brand-600 border-2 border-brand-200 hover:border-brand-500 hover:text-brand-700 bg-white rounded-full text-base font-medium transition-all duration-300 hover:shadow-lg"
            >
              View All Features
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
