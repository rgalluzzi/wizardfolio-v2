"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioInput from "@/components/PortfolioInput";
import { DEFAULT_POSITIONS } from "@/data/defaultPositions";
import { UserPosition } from "@/lib/exposureEngine";
import {
  buildPositionsSearchParams,
  normalizePositions,
} from "@/lib/positionsQuery";

export default function HomePage() {
  const router = useRouter();

  const [positions, setPositions] = useState<UserPosition[]>(
    DEFAULT_POSITIONS as UserPosition[]
  );

  const handleAnalyze = () => {
    const cleanedPositions = normalizePositions(positions);
    if (!cleanedPositions.length) {
      return;
    }

    const params = buildPositionsSearchParams(cleanedPositions);
    if (!params) {
      return;
    }

    router.push(`/results?${params}`);
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <PortfolioInput
          positions={positions}
          onChange={setPositions}
          onAnalyze={handleAnalyze}
        />
      </div>
    </main>
  );
}
