import type { VirtualTerminal } from "../virtualTerminal";

let terminal: VirtualTerminal | null = null;
export function setTerminal(t: VirtualTerminal | null): void {
  terminal = t;
}

export function getTerminal(): VirtualTerminal | null {
  return terminal;
}
