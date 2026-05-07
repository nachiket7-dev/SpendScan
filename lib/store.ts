import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuditFormData, AuditResult, ToolEntry, ToolId, UseCase } from "./types";
import { TOOLS } from "./tools";

const defaultTools = (): ToolEntry[] =>
  TOOLS.map((t) => ({
    toolId: t.id,
    plan: t.plans[0].id,
    monthlySpend: 0,
    seats: 1,
    enabled: false,
  }));

interface AuditStore {
  // Form state
  formData: AuditFormData;
  setTool: (toolId: ToolId, updates: Partial<ToolEntry>) => void;
  setTeamSize: (size: number) => void;
  setUseCase: (useCase: UseCase) => void;
  toggleTool: (toolId: ToolId) => void;
  resetForm: () => void;

  // Results state
  auditResult: AuditResult | null;
  setAuditResult: (result: AuditResult | null) => void;

  // UI state
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set) => ({
      formData: {
        tools: defaultTools(),
        teamSize: 1,
        useCase: "mixed",
      },
      auditResult: null,
      currentStep: 0,

      setTool: (toolId, updates) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tools: state.formData.tools.map((t) =>
              t.toolId === toolId ? { ...t, ...updates } : t
            ),
          },
        })),

      toggleTool: (toolId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tools: state.formData.tools.map((t) =>
              t.toolId === toolId ? { ...t, enabled: !t.enabled } : t
            ),
          },
        })),

      setTeamSize: (teamSize) =>
        set((state) => ({
          formData: { ...state.formData, teamSize },
        })),

      setUseCase: (useCase) =>
        set((state) => ({
          formData: { ...state.formData, useCase },
        })),

      resetForm: () =>
        set({
          formData: {
            tools: defaultTools(),
            teamSize: 1,
            useCase: "mixed",
          },
          auditResult: null,
          currentStep: 0,
        }),

      setAuditResult: (auditResult) => set({ auditResult }),

      setCurrentStep: (currentStep) => set({ currentStep }),
    }),
    {
      name: "ai-spend-audit-v1",
      partialize: (state) => ({
        formData: state.formData,
        auditResult: state.auditResult,
      }),
    }
  )
);
