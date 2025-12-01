'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'support@myhealthlink.com',
      link: 'mailto:support@myhealthlink.com',
      color: 'text-brand-500',
      bgColor: 'bg-brand-50',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+234 (0) 800 123 4567',
      link: 'tel:+2348001234567',
      color: 'text-success-500',
      bgColor: 'bg-success-100',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Lagos, Nigeria',
      link: '#',
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon - Fri: 9AM - 6PM WAT',
      link: '#',
      color: 'text-brand-600',
      bgColor: 'bg-brand-100',
    },
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
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-6xl font-bold font-heading text-neutral-900 mb-6"
            >
              Get in{' '}
              <span className="text-brand-600">Touch</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto"
            >
              Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl border-2 border-neutral-200 p-6 lg:p-8"
              >
                <h2 className="text-2xl lg:text-3xl font-bold font-heading text-neutral-900 mb-6">
                  Send us a message
                </h2>

                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-success-50 border-2 border-success-200 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <p className="text-success-700 font-medium">
                      Thank you! Your message has been sent. We'll get back to you soon.
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold font-heading text-neutral-900 mb-6">
                    Contact Information
                  </h2>
                  <p className="text-neutral-600 leading-relaxed mb-8">
                    Choose the best way to reach us. Our support team is available to assist you with any questions or concerns.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <motion.a
                        key={index}
                        href={info.link}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group p-6 bg-white border-2 border-neutral-200 rounded-xl hover:border-brand-300 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 ${info.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className={`w-6 h-6 ${info.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-brand-600 transition-colors">
                              {info.title}
                            </h3>
                            <p className="text-neutral-600">{info.content}</p>
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-brand-50 border-2 border-brand-200 rounded-xl">
                  <h3 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-600" />
                    Need immediate assistance?
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    For urgent matters, please call us directly or send an email with "URGENT" in the subject line. We prioritize urgent requests and aim to respond within 2 hours during business hours.
                  </p>
                </div>
              </motion.div>
            </div>
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

