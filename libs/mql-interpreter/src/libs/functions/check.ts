import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createCheck(context: ExecutionContext): Record<string, BuiltinFunction> {
  return {
    // Symbol and period information
    Digits: () => {
      return context.digits ?? 5;
    },

    Period: () => {
      return context.timeframe ?? 15;
    },

    Point: () => {
      const d = context.digits ?? 5;
      return Math.pow(10, -d);
    },

    Symbol: () => {
      return context.symbol ?? "GBPUSD";
    },

    // Error handling
    GetLastError: () => {
      return context.lastError ?? 0;
    },

    // Connection and environment checks
    IsConnected: () => {
      // In backtesting, we're always "connected"
      return true;
    },

    IsDemo: () => {
      // In backtesting, we're always in demo mode
      return true;
    },

    IsDllsAllowed: () => {
      // In backtesting, DLLs are not allowed for security
      return false;
    },

    IsExpertEnabled: () => {
      // In backtesting, experts are always enabled
      return true;
    },

    IsLibrariesAllowed: () => {
      // In backtesting, libraries are allowed
      return true;
    },

    IsOptimization: () => {
      // In backtesting, we're not in optimization mode
      return false;
    },

    IsStopped: () => {
      return context.getStopFlag ? context.getStopFlag() : 0;
    },

    IsTesting: () => {
      // In backtesting, we're always in testing mode
      return true;
    },

    IsTradeAllowed: () => {
      // In backtesting, trading is always allowed
      return true;
    },

    IsTradeContextBusy: () => {
      // In backtesting, trade context is never busy
      return false;
    },

    IsVisualMode: () => {
      // In backtesting, we're not in visual mode
      return false;
    },

    // MQL program information
    MQLInfoInteger: () => {
      // Return default MQL info
      return 0;
    },

    MQLInfoString: (propertyId: number) => {
      // Return default MQL info string based on property ID
      switch (propertyId) {
        case 0: // MQL_PROGRAM_NAME
          return "Expert";
        case 1: // MQL_PROGRAM_PATH
          return "";
        case 2: // MQL_PROGRAM_TYPE
          return "Expert";
        default:
          return "";
      }
    },

    MQLSetInteger: () => {
      // This function doesn't return anything
      return;
    },

    // Terminal information
    TerminalCompany: () => {
      return "MetaQuotes Software Corp.";
    },

    TerminalInfoDouble: () => {
      // Return default terminal info double
      return 0.0;
    },

    TerminalInfoInteger: (propertyId: number) => {
      // Return default terminal info integer based on property ID
      switch (propertyId) {
        case 0: // TERMINAL_BUILD
          return 1234;
        case 1: // TERMINAL_CODEPAGE
          return 1252;
        case 2: // TERMINAL_COMMUNITY_ACCOUNT
          return 0;
        case 3: // TERMINAL_CONNECTED
          return 1;
        case 4: // TERMINAL_DLLS_ALLOWED
          return 0;
        case 5: // TERMINAL_TRADE_ALLOWED
          return 1;
        case 6: // TERMINAL_EMAIL_ENABLED
          return 0;
        case 7: // TERMINAL_FTP_ENABLED
          return 0;
        case 8: // TERMINAL_NOTIFICATIONS_ENABLED
          return 0;
        case 9: // TERMINAL_MAXBARS
          return 1000000;
        case 10: // TERMINAL_COLOR_SCHEME
          return 0;
        case 11: // TERMINAL_MEMORY_AVAILABLE
          return 1000000000;
        case 12: // TERMINAL_MEMORY_USED
          return 100000000;
        case 13: // TERMINAL_SCREEN_DPI
          return 96;
        case 14: // TERMINAL_PING_LAST
          return 0;
        case 15: // TERMINAL_CPU_USAGE
          return 0;
        case 16: // TERMINAL_DISK_SPACE
          return 1000000000;
        default:
          return 0;
      }
    },

    TerminalInfoString: () => {
      // Return default terminal info string
      return "";
    },

    TerminalName: () => {
      return "MetaTrader";
    },

    TerminalPath: () => {
      // Return empty path in backtesting
      return "";
    },

    // Uninitialization reason
    UninitializeReason: () => {
      // Return default uninitialization reason
      return 0;
    },
  };
}
