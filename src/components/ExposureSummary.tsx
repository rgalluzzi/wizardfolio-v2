"use client";

import { ExposureBreakdown } from "@/lib/exposureEngine";

type ExposureSummaryProps = {
  exposure: ExposureBreakdown[];
  showHeader?: boolean;
  className?: string;
};

export default function ExposureSummary({
  exposure,
  showHeader = true,
  className = "",
}: ExposureSummaryProps) {
  if (!exposure || exposure.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        Enter your portfolio and tap <span className="font-medium">Analyze</span>{" "}
        to see what you really own.
      </section>
    );
  }

  const top = exposure.slice(0, 5);
  const total = exposure.reduce((acc, e) => acc + e.weightPct, 0);
  const totalSafe = total > 0 ? total : 100;

  const piePalette = [
    "#a855f7",
    "#0ea5e9",
    "#34d399",
    "#f97316",
    "#fb7185",
    "#eab308",
  ];

  const pieSegments = exposure.slice(0, 6);
  const pieSum = pieSegments.reduce((acc, seg) => acc + seg.weightPct, 0);
  const remainder = Math.max(0, totalSafe - pieSum);
  if (remainder > 0.1) {
    pieSegments.push({ symbol: "Other", weightPct: Number(remainder.toFixed(2)) });
  }

  let cursor = 0;
  const gradientStops: string[] = pieSegments
    .filter((seg) => seg.weightPct > 0)
    .map((seg, index) => {
      const slicePct = (seg.weightPct / totalSafe) * 100;
      const start = cursor;
      const end = cursor + slicePct;
      cursor = end;
      return `${piePalette[index % piePalette.length]} ${start}% ${end}%`;
    });

  const pieStyle = gradientStops.length
    ? { backgroundImage: `conic-gradient(${gradientStops.join(", ")})` }
    : undefined;

  const rootClassName =
    "w-full rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80";

  return (
    <section className="w-full rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      {showHeader && (
        <header className="mb-3">
          <h2 className="text-lg font-semibold">Your true exposure</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            These are your largest positions once ETFs are exploded into their
            underlying holdings.
          </p>
        </header>
      )}

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center">
          <div className="relative h-36 w-36">
            <div
              className="h-full w-full rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60"
              style={pieStyle}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-xs text-zinc-500 dark:text-zinc-400">
              <span className="text-[10px] uppercase tracking-wide">Total</span>
              <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {totalSafe.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {top.map((item) => (
              <div
                key={item.symbol}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/70 dark:text-zinc-400">
                  {item.symbol}
                </span>
                <span>{item.weightPct.toFixed(1)}%</span>
              </div>
            ))}
            {exposure.length > top.length && (
              <div className="inline-flex items-center rounded-full bg-zinc-50 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                + {exposure.length - top.length} more
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieSegments.map((segment, index) => (
              <div key={`${segment.symbol}-${index}`} className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-6 rounded-full"
                  style={{ backgroundColor: piePalette[index % piePalette.length] }}
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-100">
                  {segment.symbol}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {segment.weightPct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
