import { NextRequest } from "next/server";
import { saveLead, saveAuditSnapshot } from "@/lib/supabase";
import { sendAuditReportEmail } from "@/lib/resend";
import { AuditResult, LeadData } from "@/lib/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Schema Validation
// ---------------------------------------------------------------------------
const leadSchema = z.object({
  email: z.string().email("Invalid work email address"),
  auditId: z.string().min(1),
  companyName: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().optional(),
  website: z.string().optional(), // Honeypot
  auditResult: z.object({
    id: z.string(),
    totalMonthlySavings: z.number(),
    totalAnnualSavings: z.number(),
    recommendations: z.array(z.any()),
    formData: z.object({
      teamSize: z.number(),
      useCase: z.string(),
      tools: z.array(z.any()),
    }),
  }).optional(),
});

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (Serverless safe-ish)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  
  // Cleanup during call instead of background interval
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  try {
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

    const json = await request.json();
    const result = leadSchema.safeParse(json);

    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, auditId, auditResult, website, companyName, role, teamSize } = result.data;

    // Honeypot check
    if (website && website.length > 0) {
      return Response.json({ success: true });
    }

    const lead: LeadData = {
      email,
      companyName,
      role,
      teamSize,
      auditId,
    };

    // Save audit snapshot for shareable URL
    if (auditResult) {
      await saveAuditSnapshot(auditResult as AuditResult);
    }

    // Save lead
    const success = await saveLead(lead, auditResult as AuditResult);

    if (!success) {
      return Response.json(
        { error: "Failed to save lead. Please try again." },
        { status: 500 }
      );
    }

    const shareUrl = `/audit/${auditId}`;

    // Trigger transactional email (must await in serverless to prevent early exit)
    if (auditResult) {
      try {
        const emailSent = await sendAuditReportEmail({
          to: email,
          auditResult: auditResult as AuditResult,
          shareUrl,
        });
        console.log("Email send result:", emailSent);
      } catch (err) {
        console.error("Email send failed:", err);
      }
    }

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
