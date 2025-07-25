export interface VirtualFile {
  name: string;
  data: string;
  position: number;
}

/** Simple in-memory terminal used during backtests. */
export class VirtualTerminal {
  private files: Record<string, VirtualFile> = {};
  private handles: Record<number, VirtualFile> = {};
  private nextHandle = 1;
  private globalVars: Record<string, { value: number; time: number }> = {};

  /** Open or create a file and return a handle. */
  open(name: string, mode: string = 'r'): number {
    let file = this.files[name];
    if (!file) {
      file = this.files[name] = { name, data: '', position: 0 };
    }
    if (mode.includes('w')) {
      file.data = '';
      file.position = 0;
    }
    const handle = this.nextHandle++;
    this.handles[handle] = file;
    file.position = 0;
    return handle;
  }

  /** Read entire file contents from the beginning. */
  read(handle: number): string | undefined {
    const file = this.handles[handle];
    if (!file) return undefined;
    file.position = file.data.length;
    return file.data;
  }

  /** Append data to a file. */
  write(handle: number, text: string): void {
    const file = this.handles[handle];
    if (file) {
      file.data += text;
      file.position = file.data.length;
    }
  }

  close(handle: number): void {
    delete this.handles[handle];
  }

  exists(name: string): boolean {
    return name in this.files;
  }

  getFile(name: string): string | undefined {
    return this.files[name]?.data;
  }

  // ----- global variable helpers -----
  setGlobalVariable(name: string, value: number): number {
    this.globalVars[name] = {
      value,
      time: Math.floor(Date.now() / 1000),
    };
    return value;
  }

  getGlobalVariable(name: string): number {
    return this.globalVars[name]?.value ?? 0;
  }

  deleteGlobalVariable(name: string): boolean {
    const existed = name in this.globalVars;
    delete this.globalVars[name];
    return existed;
  }

  checkGlobalVariable(name: string): boolean {
    return name in this.globalVars;
  }

  getGlobalVariableTime(name: string): number {
    return this.globalVars[name]?.time ?? 0;
  }

  deleteAllGlobalVariables(prefix = ''): number {
    let count = 0;
    for (const k of Object.keys(this.globalVars)) {
      if (!prefix || k.startsWith(prefix)) {
        delete this.globalVars[k];
        count++;
      }
    }
    return count;
  }

  globalVariablesTotal(): number {
    return Object.keys(this.globalVars).length;
  }

  getGlobalVariableName(index: number): string {
    const names = Object.keys(this.globalVars);
    return names[index] ?? '';
  }

  setGlobalVariableTemp(name: string, value: number): number {
    return this.setGlobalVariable(name, value);
  }

  setGlobalVariableOnCondition(name: string, value: number, check: number): boolean {
    if (!this.globalVars[name] || this.globalVars[name].value === check) {
      this.setGlobalVariable(name, value);
      return true;
    }
    return false;
  }

  flushGlobalVariables(): number {
    // persistence not implemented
    return 0;
  }

  // ----- ui helpers -----
  print(...args: any[]): number {
    console.log(...args);
    return 0;
  }

  comment(...args: any[]): number {
    console.log(...args);
    return 0;
  }

  alert(...args: any[]): boolean {
    console.log(...args);
    return true;
  }

  playSound(_file: string): boolean {
    return true;
  }
}
