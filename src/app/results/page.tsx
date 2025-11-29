import ResultsPageClient from "./ResultsPageClient";

type ResultsPageProps = {
  searchParams?: {
    positions?: string;
  };
};

export default function ResultsPage({ searchParams }: ResultsPageProps) {
  return (
    <ResultsPageClient positionsParam={searchParams?.positions ?? null} />
  );
}
