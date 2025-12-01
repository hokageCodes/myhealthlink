'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section id="contact" className="bg-white p-12 text-center">
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
  );
}

