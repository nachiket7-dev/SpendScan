import { Metadata } from "next";
import { getAuditSnapshot } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { SharedAuditView } from "./SharedAuditView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getAuditSnapshot(id);

  if (!result) {
    return {
      title: "Audit Not Found — SpendScan",
      description: "This audit result could not be found.",
    };
  }

  const savings = formatCurrency(result.totalMonthlySavings);
  const annual = formatCurrency(result.totalAnnualSavings);
  const toolCount = result.recommendations.length;

  const title = `Save ${savings}/mo on AI tools — SpendScan Audit`;
  const description = `This team analyzed ${toolCount} AI tools and found ${savings}/mo (${annual}/yr) in potential savings. Get your free audit at SpendScan.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/audit/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuditSharePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getAuditSnapshot(id);

  if (!result) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            🔍
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Audit not found
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            This audit link may have expired or doesn&apos;t exist yet.
          </p>
          <a href="/" className="btn-primary">
            Run your own free audit →
          </a>
        </div>
      </main>
    );
  }

  return <SharedAuditView result={result} />;
}
