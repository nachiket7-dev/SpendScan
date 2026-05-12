import { NextRequest } from "next/server";
import { saveLead, saveAuditSnapshot } from "@/lib/supabase";
import { sendAuditReportEmail } from "@/lib/resend";
import { AuditResult, LeadData } from "@/lib/types";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Clean up stale entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) rateLimitMap.delete(key);
    }
  }, 60000);
}

// ---------------------------------------------------------------------------
// POST /api/leads — Lead capture endpoint
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check — if the hidden field is filled, it's a bot
    if (body.website && body.website.length > 0) {
      // Silently accept but don't store — don't tip off bots
      return Response.json({ success: true });
    }

    // Validate required fields
    const { email, auditId, auditResult } = body as {
      email: string;
      auditId: string;
      companyName?: string;
      role?: string;
      teamSize?: number;
      auditResult: AuditResult;
    };

    if (!email || !auditId) {
      return Response.json(
        { error: "Email and audit ID are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Build lead data
    const lead: LeadData = {
      email,
      companyName: body.companyName,
      role: body.role,
      teamSize: body.teamSize ? Number(body.teamSize) : undefined,
      auditId,
    };

    // Save audit snapshot for shareable URL
    if (auditResult) {
      await saveAuditSnapshot(auditResult);
    }

    // Save lead
    const success = await saveLead(lead, auditResult);

    if (!success) {
      return Response.json(
        { error: "Failed to save lead. Please try again." },
        { status: 500 }
      );
    }

    const shareUrl = `/audit/${auditId}`;

    // Trigger transactional email (non-blocking)
    sendAuditReportEmail({
      to: email,
      auditResult,
      shareUrl,
    }).catch((err) => console.error("Email send failed:", err));

    return Response.json({
      success: true,
      auditId,
      shareUrl,
    });
  } catch (error) {
    console.error("Lead capture error:", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
