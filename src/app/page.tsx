import Hero from '@/components/Hero';
import StackSection from '@/components/StackSection';
import AppsSection from '@/components/AppsSection';
import TrustBanner from '@/components/TrustBanner';
import BlogSection from '@/components/BlogSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <StackSection />
      <AppsSection />
      <TrustBanner />
      <BlogSection />
    </div>
  );
}
