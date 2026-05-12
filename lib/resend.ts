import { Resend } from 'resend';
import { AuditResult } from "./types";
import { formatCurrency } from "./utils";

// ---------------------------------------------------------------------------
// Resend — transactional email on lead capture using Official SDK
// ---------------------------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendscan.credex.rocks";

// Helper to get Resend instance only when needed to avoid build-time errors
function getResendInstance() {
  if (!RESEND_API_KEY || RESEND_API_KEY.includes("your_resend")) {
    return null;
  }
  return new Resend(RESEND_API_KEY);
}

function isConfigured(): boolean {
  return !!RESEND_API_KEY && !RESEND_API_KEY.includes("your_resend");
}

interface EmailOptions {
  to: string;
  auditResult: AuditResult;
  shareUrl: string;
}

/**
 * Send a transactional audit report email via Resend.
 */
export async function sendAuditReportEmail(options: EmailOptions): Promise<boolean> {
  const resend = getResendInstance();
  
  if (!resend) {
    console.warn("Resend not configured — skipping transactional email");
    return false;
  }

  const { to, auditResult, shareUrl } = options;
  const { totalMonthlySavings, totalAnnualSavings, recommendations } = auditResult;

  const actionableRecs = recommendations.filter(
    (r) => r.recommendationType !== "optimal"
  );

  const toolBreakdown = recommendations
    .map((r) => {
      const status =
        r.estimatedMonthlySavings > 0
          ? `💰 Save ${formatCurrency(r.estimatedMonthlySavings)}/mo — ${r.recommendedAction}`
          : `✓ ${r.recommendedAction}`;
      return `• ${r.toolName} (${r.currentPlan}): ${status}`;
    })
    .join("\n");

  const subject =
    totalMonthlySavings > 0
      ? `Your AI spend audit: save ${formatCurrency(totalMonthlySavings)}/mo`
      : `Your AI spend audit results — SpendScan`;

  const fullShareUrl = `${APP_URL}${shareUrl}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0A; color: #F5F5F5; padding: 32px 16px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 20px; font-weight: 800; color: #00C853; letter-spacing: -0.02em;">SpendScan</div>
      <div style="font-size: 12px; color: #888; margin-top: 4px;">Your AI Tool Spend Audit</div>
    </div>

    <div style="background: #111; border: 1px solid ${totalMonthlySavings >= 500 ? '#00C853' : '#1E1E1E'}; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 11px; color: #555; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">
        Estimated monthly savings
      </div>
      <div style="font-size: 48px; font-weight: 800; color: ${totalMonthlySavings >= 500 ? '#00C853' : totalMonthlySavings >= 100 ? '#FFB800' : '#888'}; letter-spacing: -0.03em;">
        ${formatCurrency(totalMonthlySavings)}
      </div>
      <div style="font-size: 14px; color: #888; margin-top: 8px;">
        ${formatCurrency(totalAnnualSavings)} annually
      </div>
    </div>

    <div style="background: #111; border: 1px solid #1E1E1E; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <div style="font-size: 11px; color: #555; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px;">
        Per-tool breakdown
      </div>
      <pre style="font-family: 'DM Mono', monospace; font-size: 13px; color: #CCC; line-height: 1.8; white-space: pre-wrap; margin: 0;">
${toolBreakdown}
      </pre>
    </div>

    ${actionableRecs.length > 0 ? `
    <div style="background: #111; border: 1px solid #1E1E1E; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <div style="font-size: 14px; color: #F5F5F5;">
        <strong>${actionableRecs.length} optimization${actionableRecs.length > 1 ? 's' : ''}</strong> identified.
        View your full report with detailed reasoning:
      </div>
    </div>
    ` : ''}

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${fullShareUrl}" style="display: inline-block; background: #00C853; color: #000; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 8px; text-decoration: none; letter-spacing: 0.02em;">
        View full report →
      </a>
    </div>

    <div style="text-align: center; font-size: 11px; color: #555; border-top: 1px solid #1E1E1E; padding-top: 24px;">
      <p>This email was sent because you submitted your email on SpendScan.</p>
      <p>SpendScan is a product of <a href="https://credex.rocks" style="color: #00C853; text-decoration: none;">Credex</a>.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: 'SpendScan <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend SDK error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Resend connection error:", err);
    return false;
  }
}
