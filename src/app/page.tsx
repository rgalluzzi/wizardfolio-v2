"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PortfolioInput from "@/components/PortfolioInput";
import { usePostHogSafe } from "@/lib/usePostHogSafe";

// Local version of UserPosition (matches PortfolioInput + results page)
type UserPosition = {
  symbol: string;
  weightPct: number;
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const positionsParam = searchParams.get("positions");
  const { capture } = usePostHogSafe();

  const initialPositions = useMemo<UserPosition[]>(() => {
    if (!positionsParam) return [{ symbol: "", weightPct: 0 }];

    try {
      const decoded = decodeURIComponent(positionsParam);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        return parsed as UserPosition[];
      }
    } catch (err) {
      console.error("Failed to parse positions from URL", err);
    }

    return [{ symbol: "", weightPct: 0 }];
  }, [positionsParam]);

  const [positions, setPositions] = useState<UserPosition[]>(initialPositions);

  // when the URL query changes (coming back from /results), sync state
  useEffect(() => {
    setPositions(initialPositions);
  }, [initialPositions]);

  useEffect(() => {
    capture("etf_mix_viewed", {
      num_etfs: positions.length,
      etfs: positions.map((p) => p.symbol),
      weights: positions.map((p) => p.weightPct),
    });
  }, [positions, capture]);

  const handleAnalyze = () => {
    capture("etf_mix_analyzed", {
      num_etfs: positions.length,
      etfs: positions.map((p) => p.symbol),
      weights: positions.map((p) => p.weightPct),
    });
    const payload = encodeURIComponent(JSON.stringify(positions));
    router.push(`/results?positions=${payload}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <PortfolioInput
          positions={positions}
          onChange={(next) => setPositions(next)}
          onAnalyze={handleAnalyze}
        />
      </div>
    </div>
  );
}
