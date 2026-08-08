import { Hero } from "@/components/Hero";
import { SelectedWork } from "@/components/SelectedWork";
import { Stack } from "@/components/Stack";
import { About } from "@/components/About";
import { ExperienceSkills } from "@/components/ExperienceSkills";
import { Testimonials } from "@/components/Testimonials";
import { LatestWriting } from "@/components/LatestWriting";
import { ContactCTA } from "@/components/ContactCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <Stack />
      <About />
      <ExperienceSkills />
      <Testimonials />
      <LatestWriting />
      <ContactCTA />
    </>
  );
}
