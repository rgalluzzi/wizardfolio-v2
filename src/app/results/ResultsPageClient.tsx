"use client";

import { useEffect, useMemo, useState } from "react";
import ExposureSummary from "@/components/ExposureSummary";
import HoldingsTable from "@/components/HoldingsTable";
import RegionExposureChart from "@/components/RegionExposureChart";
import { DEFAULT_POSITIONS } from "@/data/defaultPositions";
import { useRouter } from "next/navigation";
import { AppleShareIcon } from "@/components/icons/AppleShareIcon";
import { usePostHogSafe } from "@/lib/usePostHogSafe";

// Local types
type UserPosition = { symbol: string; weightPct: number };
type ApiExposureRow = {
  holding_symbol: string;
  holding_name: string;
  country?: string | null;
  sector?: string | null;
  asset_class?: string | null;
  total_weight_pct: number;
};
type SubmissionState = "idle" | "loading" | "success" | "error";

const FEATURE_OPTIONS = [
  "More ETF coverage",
  "Support individual stocks",
  "Connect my real portfolio",
  "More ETF insights & charts",
  "Multi-currency insights (CAD vs USD)",
  "Something else…",
];

export default function ResultsPageClient({
  positionsParam,
}: {
  positionsParam: string | null;
}) {
  const router = useRouter();
  const { capture } = usePostHogSafe();

  // Parse positions from query param
  const positions = useMemo<UserPosition[]>(() => {
    if (!positionsParam) return DEFAULT_POSITIONS;

    try {
      return JSON.parse(decodeURIComponent(positionsParam));
    } catch {
      return DEFAULT_POSITIONS;
    }
  }, [positionsParam]);

  // ----- State -----
  const [exposure, setExposure] = useState<ApiExposureRow[]>([]);
  const [slide, setSlide] = useState<0 | 1 | 2 | 3>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Survey state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackState, setFeedbackState] =
    useState<SubmissionState>("idle");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const top10 = useMemo(
    () =>
      [...exposure]
        .sort(
          (a, b) =>
            (b.total_weight_pct ?? 0) - (a.total_weight_pct ?? 0)
        )
        .slice(0, 10),
    [exposure]
  );

  // ----- Tracking slide views -----
  useEffect(() => {
    const slideName =
      slide === 0
        ? "Exposure"
        : slide === 1
        ? "Region"
        : slide === 2
        ? "Holdings"
        : "Feedback";

    capture("results_slide_viewed", {
      slide_index: slide,
      slide_name: slideName,
      has_exposure: exposure.length > 0,
    });
  }, [slide, exposure.length, capture]);

  // ----- Fetch exposure -----
  useEffect(() => {
    const fetchExposure = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const etfs = positions.map((p) => p.symbol);
        const weights = positions.map((p) => p.weightPct);

        const res = await fetch("/api/etf-exposure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ etfs, weights }),
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) throw new Error(body?.error || "Failed to analyze");

        const holdings = body?.exposure ?? [];
        setExposure(holdings);

        capture("results_viewed", {
          num_holdings: holdings.length,
          num_etfs: positions.length,
          top_symbols: positions.map((p) => p.symbol).slice(0, 5),
        });
      } catch (err: any) {
        setExposure([]);
        const msg =
          err?.message || "Something went wrong while analyzing.";

        setError(msg);

        capture("exposure_error", {
          error_message: String(msg),
          num_etfs: positions.length,
        });
      } finally {
        setIsLoading(false);
        setSlide(0);
      }
    };

    fetchExposure();
  }, [positions, capture]);

  // ----- Edit inputs -----
  const handleEditInputs = () => {
    if (positionsParam) router.push(`/?positions=${positionsParam}`);
    else router.push("/");
  };

  // ----- Sharing -----
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Portfolio Exposure",
          text: "Check out my ETF look-through",
          url,
        });
        capture("results_shared", { method: "web_share" });
        return;
      } catch {}
    }

    await navigator.clipboard.writeText(url);
    capture("results_shared", { method: "clipboard" });
  };

  // ----- Swiping -----
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) =>
    setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      setSlide((prev) =>
        dx < 0 ? (prev === 3 ? 3 : (prev + 1) as any) : prev === 0 ? 0 : (prev - 1 as any)
      );
    }
    setTouchStartX(null);
  };

  // ----- Title -----
  const title =
    slide === 0
      ? "Your true exposure"
      : slide === 1
      ? "By region"
      : slide === 2
      ? "Top holdings"
      : "Help shape WizardFolio";

  // ----- Survey -----
  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };
  const hasSomethingElse = selectedFeatures.includes("Something else…");

  const handleFeedbackSubmit = async (e: any) => {
    e.preventDefault();
    setFeedbackError(null);

    if (selectedFeatures.length === 0) {
      setFeedbackError("Pick at least one option.");
      return;
    }

    setFeedbackState("loading");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedFeatures,
          message: message.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setFeedbackState("success");
      capture("feedback_submitted", {
        selected_features: selectedFeatures,
      });
    } catch {
      setFeedbackState("error");
      setFeedbackError("Something went wrong.");
    }
  };

  return (
    <div className="space-y-4">
      {/* your entire UI unchanged */}
      {/* ---------- OMITTED HERE TO KEEP MESSAGE SHORT ---------- */}
      {/* Just paste your whole component body here */}
    </div>
  );
}