import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/landing/Hero";
import ResearchComposer from "@/components/landing/ResearchComposer";
import FeatureCards from "@/components/landing/FeatureCards";
import JourneyShowcase from "@/components/landing/JourneyShowcase";
import SampleShowcase from "@/components/landing/SampleShowcase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShinCheck — Know what you know. Discover what's missing." },
      {
        name: "description",
        content:
          "ShinCheck finds missing information, detects conflicting claims, checks outdated details and turns them into a verification checklist you can actually complete.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <ResearchComposer />
      <FeatureCards />
      <JourneyShowcase />
      <SampleShowcase />
    </>
  );
}