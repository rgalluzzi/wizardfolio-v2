"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PortfolioInput from "@/components/PortfolioInput";

export default function HomePage() {
  const router = useRouter();

  // Called when the user taps the Analyze button in PortfolioInput
  const handleAnalyze = () => {
    // For now, we just send them to /results.
    // The results page already falls back to DEFAULT_POSITIONS if there is
    // no positions query param present.
    router.push("/results");
  };

  return (
    <div className="space-y-4">
      <PortfolioInput onAnalyze={handleAnalyze} />
    </div>
  );
}