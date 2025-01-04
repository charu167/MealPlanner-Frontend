import React from "react";
import { Spotlight } from "@/components/ui/Spotlight";
import { BentoGridDemo } from "@/components/homepage/featureGrid";
import Link from "next/link";

// =========================
// COMPONENT
// =========================

/**
 * Home Component
 *
 * Purpose:
 * - Serves as the landing page for the application.
 * - Displays the main title, a brief description, and navigation buttons.
 * - Showcases feature highlights using the BentoGridDemo component.
 */
export default function Home() {
  return (
    <div className="bg-black antialiased bg-grid-white/[0.02] mb-44">
      {/* =========================
          HERO SECTION
          ========================= */}
      <div className="h-[40rem] w-full flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        {/* Spotlight Effect */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        {/* Content Container */}
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
          {/* Title */}
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            NutriCraft
          </h1>
          {/* Description */}
          <p className="mt-4 font-semibold text-base text-neutral-300 max-w-lg text-center mx-auto">
            Your ultimate guide to balanced eating and effortless planning.
          </p>
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            {/* Start Planning Button */}
            <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#0A0A0A,45%,#1e2631,55%,#0A0A0A)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:ring-offset-slate-50">
              <Link href={"/dashboard"}>Start Planning</Link>
            </button>
            {/* Know Macros Button */}
            <button className="inline-flex h-12 items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#0A0A0A,55%,#1e2631,55%,#0A0A0A)] bg-[length:200%_100%] px-6 font-medium text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              <Link href={"/macro-calculator"}>Know Macros</Link>
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          FEATURE GRID
          ========================= */}
      <BentoGridDemo />
    </div>
  );
}
