import PricingGrid from '@/auth/stripe/PricingTable';
import { CallToAction } from '@/interactive/Home/call-to-action';
import { Contact } from '@/interactive/Home/contact';
import { Features } from '@/interactive/Home/features';
import { Hero } from '@/interactive/Home/hero';
import { HowItWorks } from '@/interactive/Home/how-it-works';

export default function InteractiveHome() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />

      <CallToAction />
      <div className='flex flex-col items-center justify-center'>
        <PricingGrid />
      </div>
      <Contact />
      <div className='flex flex-col items-center justify-center'>
        <a href='/privacy'>Privacy Policy</a>
      </div>
    </>
  );
}
