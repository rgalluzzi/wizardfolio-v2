export type EtfHolding = {
  symbol: string;
  weight: number;
};

export type EtfHoldingsMap = {
  [etfSymbol: string]: EtfHolding[];
};

export const etfHoldings: EtfHoldingsMap = {
  SPY: [
    { symbol: "AAPL", weight: 0.07 },
    { symbol: "MSFT", weight: 0.065 },
    { symbol: "AMZN", weight: 0.03 },
    { symbol: "NVDA", weight: 0.025 },
    { symbol: "GOOG", weight: 0.02 },
    { symbol: "META", weight: 0.018 },
    { symbol: "BRK.B", weight: 0.017 },
    { symbol: "TSLA", weight: 0.016 },
    { symbol: "UNH", weight: 0.015 },
    { symbol: "JPM", weight: 0.014 },
  ],
  QQQ: [
    { symbol: "AAPL", weight: 0.12 },
    { symbol: "MSFT", weight: 0.1 },
    { symbol: "NVDA", weight: 0.07 },
    { symbol: "AMZN", weight: 0.05 },
    { symbol: "META", weight: 0.04 },
    { symbol: "GOOG", weight: 0.035 },
    { symbol: "TSLA", weight: 0.025 },
    { symbol: "AVGO", weight: 0.02 },
    { symbol: "PEP", weight: 0.015 },
    { symbol: "COST", weight: 0.015 },
  ],
  XEQT: [
    { symbol: "AAPL", weight: 0.05 },
    { symbol: "MSFT", weight: 0.045 },
    { symbol: "TD", weight: 0.03 },
    { symbol: "RY", weight: 0.03 },
    { symbol: "SHOP", weight: 0.02 },
    { symbol: "BNS", weight: 0.018 },
    { symbol: "ENB", weight: 0.017 },
    { symbol: "CP", weight: 0.015 },
    { symbol: "BAM", weight: 0.014 },
    { symbol: "CNQ", weight: 0.014 },
  ],
  VEQT: [
    { symbol: "AAPL", weight: 0.05 },
    { symbol: "MSFT", weight: 0.045 },
    { symbol: "AMZN", weight: 0.03 },
    { symbol: "JNJ", weight: 0.02 },
    { symbol: "TSLA", weight: 0.02 },
    { symbol: "GOOG", weight: 0.018 },
    { symbol: "NVDA", weight: 0.016 },
    { symbol: "META", weight: 0.015 },
    { symbol: "UNH", weight: 0.013 },
    { symbol: "JPM", weight: 0.012 },
  ],
  ZSP: [
    { symbol: "AAPL", weight: 0.07 },
    { symbol: "MSFT", weight: 0.065 },
    { symbol: "AMZN", weight: 0.03 },
    { symbol: "NVDA", weight: 0.025 },
    { symbol: "GOOG", weight: 0.02 },
    { symbol: "META", weight: 0.018 },
    { symbol: "TSLA", weight: 0.016 },
    { symbol: "BRK.B", weight: 0.015 },
    { symbol: "UNH", weight: 0.014 },
    { symbol: "XOM", weight: 0.013 },
  ],
};
