'use client';

import { useState } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import FeaturesListSection from '@/components/sections/FeaturesListSection';
import CTASection from '@/components/sections/CTASection';
import FAQsSection from '@/components/sections/FAQsSection';

export default function Home() {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      <HeroSection onToggleFeatures={() => setShowFeatures(!showFeatures)} />
      <FeaturesSection />
      <HowItWorksSection showFeatures={showFeatures} />
      <FeaturesListSection />
      <FAQsSection />
      <CTASection />
    </div>
  );
}