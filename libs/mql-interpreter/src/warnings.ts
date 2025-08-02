export interface WarningDefinition {
  code: string;
  description: string;
}

export const warnings = {
  overrideNonVirtual: {
    code: "override-non-virtual",
    description: "emitted when a derived method overrides a non-virtual base method",
  },
  overrideMissing: {
    code: "override-missing",
    description: "emitted when a method is marked `override` but no base method exists",
  },
} as const;

export type WarningCode = (typeof warnings)[keyof typeof warnings]["code"];

export function getWarnings(): WarningDefinition[] {
  return Object.values(warnings);
}

export function getWarningCodes(): WarningCode[] {
  return getWarnings().map((w) => w.code) as WarningCode[];
}
