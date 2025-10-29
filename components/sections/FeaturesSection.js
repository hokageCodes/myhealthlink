'use client';

import { Shield, Clock, Share2, TrendingUp, FileText, Users } from 'lucide-react';

export default function FeaturesSection() {
  const reasons = [
    {
      icon: Clock,
      title: 'Save Time, Skip the Paper Chase',
      description: 'No more digging through folders or hunting for lab results in WhatsApp chats. Everything you need is organized in one secure place.',
      color: 'text-brand-500',
      bgColor: 'bg-brand-50',
      borderColor: 'border-brand-200'
    },
    {
      icon: Share2,
      title: 'Share Instantly with One Link',
      description: 'Generate a secure QR code or link to share your complete health profile with doctors, hospitals, or caregivers - in seconds, because your health matters',
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
      borderColor: 'border-accent-200'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Health Journey',
      description: 'Monitor blood pressure, glucose, weight, and more over time. Spot patterns and share progress reports with your healthcare team.',
      color: 'text-success-500',
      bgColor: 'bg-success-100',
      borderColor: 'border-success-300'
    },
    {
      icon: Shield,
      title: 'Emergency-Ready, Always',
      description: 'In critical moments, responders can access your blood type, allergies, and emergency contacts instantly via your SECURE QR code or link.',
      color: 'text-danger-500',
      bgColor: 'bg-danger-100',
      borderColor: 'border-danger-300'
    },
    {
      icon: FileText,
      title: 'Never Repeat Tests Again',
      description: 'Keep all your medical documents; lab results, X-rays, prescriptions, in one place. Avoid costly repeat tests and ensure continuity of care.',
      color: 'text-brand-600',
      bgColor: 'bg-brand-100',
      borderColor: 'border-brand-300'
    },
    {
      icon: Users,
      title: 'Perfect for Everyone',
      description: 'Whether you\'re managing chronic conditions, helping aging parents, or tracking your vitals, MyHealthLink adapts to your needs.',
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
      borderColor: 'border-accent-300'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          {/* <div className="inline-flex items-center space-x-2 bg-brand-50 px-4 py-2 rounded-full border border-brand-200 mb-6">
            <span className="text-sm font-semibold text-brand-700">WHY MYHEALTHLINK?</span>
          </div> */}
          
          <h2 className="text-4xl lg:text-5xl font-semibold font-heading text-neutral-900 mb-6">
            Your health story deserves better than{' '}
            <span className="text-brand-600">scattered folders</span>
          </h2>
          
          <p className="text-lg text-neutral-600 leading-relaxed">
            From Lagos to every corner of Nigeria, millions struggle with lost records, repeat tests, and fragmented care. 
            We're changing that — one secure link at a time.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className={`group p-8 rounded-2xl border-2 ${reason.borderColor} ${reason.bgColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 ${reason.bgColor} rounded-xl flex items-center justify-center mb-5 border ${reason.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${reason.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold font-heading text-neutral-900 mb-3">
                  {reason.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
      </div>
    </section>
  );
}