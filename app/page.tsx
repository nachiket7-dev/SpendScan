import { LandingHero } from "@/components/landing/LandingHero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AuditFormWrapper } from "@/components/form/AuditFormWrapper";

export default function Home() {
  return (
    <main>
      <LandingHero />
      <HowItWorks />
      <AuditFormWrapper />
    </main>
  );
}
