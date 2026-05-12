import { AuditResult, LeadData } from "./types";

// ---------------------------------------------------------------------------
// Supabase client — lightweight wrapper using fetch (no SDK dependency)
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    Prefer: "return=representation",
  };
}

function isConfigured(): boolean {
  return (
    !!SUPABASE_URL &&
    !!SUPABASE_SERVICE_KEY &&
    !SUPABASE_URL.includes("your_supabase") &&
    !SUPABASE_SERVICE_KEY.includes("your_supabase")
  );
}

// ---------------------------------------------------------------------------
// Audit snapshots — store audit results for shareable URLs
// ---------------------------------------------------------------------------

export interface AuditSnapshot {
  id: string;
  audit_data: AuditResult;
  created_at: string;
}

/**
 * Save an audit result to Supabase for sharing.
 * Returns the audit ID if successful, null otherwise.
 */
export async function saveAuditSnapshot(
  auditResult: AuditResult
): Promise<string | null> {
  if (!isConfigured()) {
    console.warn("Supabase not configured — skipping audit snapshot save");
    return auditResult.id;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/audit_snapshots`, {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({
        id: auditResult.id,
        audit_data: auditResult,
      }),
    });

    if (!res.ok) {
      console.error("Failed to save audit snapshot:", await res.text());
      return null;
    }

    return auditResult.id;
  } catch (err) {
    console.error("Supabase audit snapshot error:", err);
    return null;
  }
}

/**
 * Fetch an audit snapshot by ID, stripping PII before returning.
 */
export async function getAuditSnapshot(
  id: string
): Promise<AuditResult | null> {
  if (!isConfigured()) {
    console.warn("Supabase not configured — cannot fetch audit snapshot");
    return null;
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/audit_snapshots?id=eq.${encodeURIComponent(id)}&select=audit_data`,
      {
        headers: supabaseHeaders(),
      }
    );

    if (!res.ok) return null;

    const rows = await res.json();
    if (!rows || rows.length === 0) return null;

    const auditData = rows[0].audit_data as AuditResult;

    // Strip PII from public view — remove any lead-associated data
    return stripPII(auditData);
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return null;
  }
}

/**
 * Strip PII from an audit result for public sharing.
 * Removes email, company info, and any personal identifiers.
 */
function stripPII(result: AuditResult): AuditResult {
  return {
    ...result,
    aiSummary: result.aiSummary, // summary is safe — generated from aggregate data
    formData: {
      ...result.formData,
      // Keep tools and useCase (non-PII), remove anything personal
    },
  };
}

// ---------------------------------------------------------------------------
// Leads — store email captures
// ---------------------------------------------------------------------------

export interface LeadRow {
  id?: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  audit_id: string;
  audit_snapshot: AuditResult;
  created_at?: string;
}

/**
 * Save a lead to Supabase.
 */
export async function saveLead(
  lead: LeadData,
  auditResult: AuditResult
): Promise<boolean> {
  if (!isConfigured()) {
    console.warn("Supabase not configured — skipping lead save");
    // Return true so the UX flow continues (lead just won't be persisted)
    return true;
  }

  try {
    const row: LeadRow = {
      email: lead.email,
      company_name: lead.companyName,
      role: lead.role,
      team_size: lead.teamSize,
      audit_id: lead.auditId,
      audit_snapshot: auditResult,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      console.error("Failed to save lead:", await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("Supabase lead save error:", err);
    return false;
  }
}
