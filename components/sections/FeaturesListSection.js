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
} from 'lucide-react';

export default function FeaturesListSection() {
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
  ];

  const mid = Math.ceil(features.length / 2);
  const leftFeatures = features.slice(0, mid);
  const rightFeatures = features.slice(mid);

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
          <div className="grid gap-12 items-start lg:grid-cols-[1fr_auto_1fr]">
            {/* Left column */}
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
                <div className="relative bg-neutral-900 rounded-[3rem] p-3 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-900 rounded-b-3xl z-10" />

                  {/* Screen */}
                  <div className="relative bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 text-xs font-medium text-neutral-900">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-3 border border-neutral-900 rounded-sm" />
                        <div className="w-1 h-3 bg-neutral-900 rounded-sm" />
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="px-6 pt-16 pb-8 space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-neutral-900">
                            Health Hub
                          </h3>
                          <p className="text-sm text-neutral-500">
                            All your records
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                          <Heart
                            className="w-6 h-6 text-brand-600"
                            fill="currentColor"
                          />
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-brand-50 rounded-2xl p-4 border border-brand-200">
                          <div className="text-3xl font-bold text-brand-600 mb-1">
                            24
                          </div>
                          <div className="text-xs text-neutral-600">
                            Documents
                          </div>
                        </div>
                        <div className="bg-accent-50 rounded-2xl p-4 border border-accent-200">
                          <div className="text-3xl font-bold text-accent-600 mb-1">
                            3
                          </div>
                          <div className="text-xs text-neutral-600">
                            Providers
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-neutral-500 uppercase">
                          Recent
                        </h4>

                        {[
                          {
                            type: 'Lab Result',
                            time: '2 hours ago',
                            color: 'bg-success-500',
                          },
                          {
                            type: 'Prescription',
                            time: '1 day ago',
                            color: 'bg-brand-500',
                          },
                          {
                            type: 'X-Ray Scan',
                            time: '3 days ago',
                            color: 'bg-accent-500',
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-xl"
                          >
                            <div
                              className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}
                            >
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {item.type}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {item.time}
                              </p>
                            </div>
                            <Check className="w-4 h-4 text-success-500" />
                          </div>
                        ))}
                      </div>

                      {/* QR Code Card */}
                      <div className="rounded-2xl p-4 text-white">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm opacity-90">
                              Share your profile
                            </p>
                            <p className="text-lg font-bold">QR Code</p>
                          </div>
                          <QrCode className="w-8 h-8" />
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
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
        </div>
      </div>
    </section>
  );
}
