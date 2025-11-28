"use client";

import { useState } from "react";
import { UserPosition } from "@/lib/exposureEngine";
import PortfolioInput from "@/components/PortfolioInput";
import { DEFAULT_POSITIONS } from "@/data/defaultPositions";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [positions, setPositions] = useState<UserPosition[]>(DEFAULT_POSITIONS);

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
