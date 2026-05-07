import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
}

export function formatCurrency(amount: number, short = false): string {
  if (short && amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export const USE_CASE_LABELS: Record<string, string> = {
  coding: "Coding & Development",
  writing: "Writing & Content",
  data: "Data & Analysis",
  research: "Research",
  mixed: "Mixed / General",
};

export const RECOMMENDATION_LABELS: Record<string, string> = {
  downgrade_plan: "Downgrade Plan",
  switch_tool: "Switch Tool",
  use_credits: "Buy via Credex",
  optimal: "Already Optimal",
  reduce_seats: "Remove Unused Seats",
};
