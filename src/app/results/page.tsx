"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  computeExposure,
  ExposureBreakdown,
  UserPosition,
} from "@/lib/exposureEngine";
import ExposureSummary from "@/components/ExposureSummary";
import HoldingsTable from "@/components/HoldingsTable";
import { DEFAULT_POSITIONS } from "@/data/defaultPositions";
import { useRouter, useSearchParams } from "next/navigation";

const shareTargets = [
  { id: "instagram", label: "Instagram" },
  { id: "gallery", label: "Gallery" },
  { id: "x", label: "X" },
  { id: "facebook", label: "Facebook" },
] as const;

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const positionsParam = searchParams.get("positions");
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareInProgress, setShareInProgress] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const positions = useMemo<UserPosition[]>(() => {
    if (!positionsParam) {
      return DEFAULT_POSITIONS;
    }

    try {
      return JSON.parse(decodeURIComponent(positionsParam)) as UserPosition[];
    } catch {
      return DEFAULT_POSITIONS;
    }
  }, [positionsParam]);

  const [exposure, setExposure] = useState<ExposureBreakdown[]>([]);
  const [stepTwoView, setStepTwoView] = useState<"exposure" | "holdings">(
    "exposure"
  );

  useEffect(() => {
    setExposure(computeExposure(positions));
    setStepTwoView("exposure");
  }, [positions]);

  const handleSwapView = () => {
    setStepTwoView((prev) => (prev === "exposure" ? "holdings" : "exposure"));
  };

  const handleEditInputs = () => {
    router.push("/");
  };

  const captureCardImage = async () => {
    if (!cardRef.current) {
      return null;
    }

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#fff",
    });

    return canvas.toDataURL("image/png");
  };

  const handleShareTarget = async (target: (typeof shareTargets)[number]) => {
    setShareMessage(null);
    setShareInProgress(true);
    try {
      const imageDataUrl = await captureCardImage();
      if (!imageDataUrl) {
        setShareMessage("Could not capture the card for sharing.");
        return;
      }

      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "wizardfolio-exposure.png", {
        type: blob.type,
      });

      const sharePayload: ShareData = {
        title: "Wizardfolio exposure",
        text: `Sharing my exposure (via ${target.label}).`,
      };

      const canShareFiles =
        typeof navigator.share === "function" &&
        (typeof navigator.canShare !== "function" ||
          navigator.canShare({ files: [file] }));

      if (canShareFiles) {
        await navigator.share({ ...sharePayload, files: [file] });
        setShareMessage(`Shared to ${target.label}.`);
        return;
      }

      if (navigator.share) {
        await navigator.share(sharePayload);
        setShareMessage(`Shared to ${target.label}.`);
        return;
      }

      if (target.id === "gallery") {
        const link = document.createElement("a");
        link.href = imageDataUrl;
        link.download = "wizardfolio-exposure.png";
        link.click();
        setShareMessage(
          "Image saved; open your gallery app to post it (downloaded file)."
        );
        return;
      }

      const encodedPage = encodeURIComponent(
        `${window.location.origin}/results`
      );
      const shareText = encodeURIComponent(
        "Check my exposure on Wizardfolio: " + window.location.origin
      );

      const fallbackUrl =
        target.id === "instagram"
          ? "https://www.instagram.com/"
          : target.id === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodedPage}`
          : `https://twitter.com/intent/tweet?text=${shareText}`;

      window.open(fallbackUrl, "_blank");
      setShareMessage(
        `Opened ${target.label}; paste or upload the downloaded image if needed.`
      );
    } catch (error) {
      console.error(error);
      setShareMessage("Sharing failed. Try again or download the image.");
    } finally {
      setShareInProgress(false);
      setShareMenuOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-500 via-indigo-500 to-blue-600 p-px shadow-2xl shadow-pink-400/50">
        <div className="rounded-3xl bg-white/90 p-5 dark:bg-zinc-900/80">
          {stepTwoView === "exposure" ? (
            <ExposureSummary exposure={exposure} showHeader={false} />
          ) : (
            <HoldingsTable exposure={exposure} showHeader={false} />
          )}
        </div>

        {/* Overlay label */}
        <div className="absolute bottom-2 left-3 z-20 text-[10px] font-semibold tracking-wide text-white/70 dark:text-white/60">
          Powered by <span className="text-white/90">WizardFolio</span>
        </div>
      </div>


        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          <button
            type="button"
            aria-label="Share exposure card"
            onClick={() => setShareMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 text-zinc-500 shadow-lg shadow-zinc-900/10 backdrop-blur dark:border-zinc-900 dark:bg-zinc-900/70 dark:text-zinc-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="currentColor"
            >
              <path d="M18 8a3 3 0 0 0-2.995 2.824L15 11h-2L12.995 9.95A3.001 3.001 0 0 0 7 9a3 3 0 0 0 0 6 2.971 2.971 0 0 0 1.657-.506l1.5 1.5A3.002 3.002 0 0 0 11 20a3 3 0 1 0 0-6 2.971 2.971 0 0 0-1.657.506L7.845 12.5A3 3 0 0 0 6 12a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3zm-2 18a3 3 0 0 0 2.995-2.824L19 23H5a3 3 0 0 0-2.995 2.824L2 26h14z" />
            </svg>
          </button>

          {shareMenuOpen && (
            <div className="w-48 rounded-2xl border border-zinc-200 bg-white/90 p-2 text-xs shadow-2xl shadow-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900/90">
              {shareTargets.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => handleShareTarget(target)}
                  className="w-full rounded-xl px-3 py-2 text-left text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {target.label}
                </button>
              ))}
              {shareInProgress && (
                <p className="mt-1 text-xs text-zinc-500">Capturing card…</p>
              )}
              {shareMessage && (
                <p className="mt-1 text-xs text-zinc-500">{shareMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-2xl shadow-indigo-200/40 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-black/40">
        <div className="space-y-4 rounded-3xl bg-white/95 px-5 py-5 dark:bg-zinc-900/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Step 2
              </p>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {stepTwoView === "exposure"
                  ? "Your true exposure"
                  : "Holdings breakdown"}
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Swap the story to go from the macro exposure to the full list of
                holdings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleEditInputs}
                className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Edit inputs
              </button>
              <button
                type="button"
                onClick={handleSwapView}
                className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-300"
              >
                Swap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
