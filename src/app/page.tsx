"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioInput from "@/components/PortfolioInput";
import { DEFAULT_POSITIONS } from "@/data/defaultPositions";

type UserPosition = {
  symbol: string;
  weightPct: number;
};

export default function HomePage() {
  const router = useRouter();

  // Local positions state drives PortfolioInput
  const [positions, setPositions] = useState<UserPosition[]>(
    DEFAULT_POSITIONS as UserPosition[]
  );

  const handleAnalyze = () => {
    const encoded = encodeURIComponent(JSON.stringify(positions));
    router.push(`/results?positions=${encoded}`);
  };

  return (
    <div className="space-y-4">
      <PortfolioInput
        positions={positions}
        onChange={setPositions}
        onAnalyze={handleAnalyze}
      />
    </div>
  );
}