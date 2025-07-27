export interface BuiltinParam {
  type: string;
  optional?: boolean;
}

export interface BuiltinSignature {
  parameters: BuiltinParam[];
  variadic?: boolean;
}

export const builtinSignatures: Record<string, BuiltinSignature> = {
  Print: { parameters: [], variadic: true },
  Alert: { parameters: [], variadic: true },
  Comment: { parameters: [], variadic: true },
  PrintFormat: { parameters: [{ type: 'string' }], variadic: true },
  GetTickCount: { parameters: [] },
  GetTickCount64: { parameters: [] },
  GetMicrosecondCount: { parameters: [] },
  Sleep: { parameters: [{ type: 'int' }] },
  PlaySound: { parameters: [{ type: 'string' }] },
  SendMail: { parameters: [
    { type: 'string' },
    { type: 'string' },
    { type: 'string' },
  ] },
  SendNotification: { parameters: [{ type: 'string' }] },
  SendFTP: { parameters: [
    { type: 'string' },
    { type: 'string' },
  ] },
  TerminalClose: { parameters: [] },
  ExpertRemove: { parameters: [] },
  DebugBreak: { parameters: [] },
  MessageBox: { parameters: [
    { type: 'string' },
    { type: 'string', optional: true },
    { type: 'int', optional: true },
  ] },
  StringTrimLeft: { parameters: [{ type: 'string' }] },
};

