import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="home" className="bg-white relative overflow-hidden bg-background mt-[-20px]">
      {/* Main Container */}
      <div className="relative container flex flex-col items-center justify-center py-16 text-center lg:py-16">
        {/* Subheading */}
        <p className="text-base font-medium tracking-wide uppercase text-brand-600">
          Simplifying Care
        </p>

        {/* Main Heading */}
        <h1 className="mt-4 text-4xl font-heading font-semibold text-neutral-900 sm:text-5xl lg:text-6xl max-w-4xl">
          One secure link.<br />
          <span className="text-brand-500">For all your health records.</span>
        </h1>

        {/* Paragraph */}
        <p className="mt-6 max-w-2xl text-lg text-neutral-600">
          MyHealthLink helps you store, manage, and share your complete health
          profile securely — accessible anytime, anywhere.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button className="inline-flex items-center justify-center px-8 py-3 text-white bg-brand-500 hover:bg-brand-600 rounded-full text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg">
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>

          <button className="inline-flex items-center justify-center px-8 py-3 text-brand-600 border border-brand-200 hover:border-brand-500 hover:text-brand-700 bg-white rounded-full text-base font-medium transition-all duration-300">
            Learn More
          </button>
        </div>

        {/* Mockup / Illustration */}
        <div className="relative mt-20">
          <Image
            src="https://landingfoliocom.imgix.net/store/collection/dusk/images/hero/4/dashboard-mockup.png"
            alt="Health dashboard preview"
            width={1200}
            height={800}
            className="w-full max-w-5xl mx-auto rounded-3xl shadow-soft"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
