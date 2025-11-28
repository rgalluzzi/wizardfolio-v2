"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPosition } from "@/lib/exposureEngine";
import PortfolioInput from "@/components/PortfolioInput";
import { DEFAULT_POSITIONS } from "@/data/defaultPositions";

type HomePageProps = {
  searchParams?: {
    positions?: string;
  };
};

export default function HomePage({ searchParams }: HomePageProps) {
  const router = useRouter();

  const initialPositions = useMemo<UserPosition[]>(() => {
    const raw = searchParams?.positions;
    if (!raw) return DEFAULT_POSITIONS;

    try {
      const decoded = decodeURIComponent(raw);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        return parsed as UserPosition[];
      }
    } catch (err) {
      console.error("Failed to parse positions from URL", err);
    }

    return DEFAULT_POSITIONS;
  }, [searchParams?.positions]);

  // State derived from URL params
  const [positions, setPositions] = useState<UserPosition[]>(initialPositions);

  // ⭐ NEW: when searchParams change, update the input fields
  useEffect(() => {
    setPositions(initialPositions);
  }, [initialPositions]);

  const handleAnalyze = () => {
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