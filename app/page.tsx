import { Nav } from "./components/landing/Nav";
import { Hero } from "./components/landing/Hero";
import {
  Pain,
  PersonaImportance,
  WhyThread,
  ROI,
  TrustAnchor,
  HowItWorks,
  Pricing,
  FAQ,
  ClosingCTA,
  Footer,
} from "./components/landing/Sections";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Pain />
        <PersonaImportance />
        <WhyThread />
        <HowItWorks />
        <ROI />
        <TrustAnchor />
        <Pricing />
        <FAQ />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}
