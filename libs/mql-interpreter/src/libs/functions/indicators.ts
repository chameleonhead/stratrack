/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";
import { iMA, iMAOnArray as maOnArray } from "../../ta/ma";
import { iMACD } from "../../ta/macd";
import { iATR } from "../../ta/atr";
import { iRSI, iRSIOnArray as rsiOnArray } from "../../ta/rsi";
import { iCustom } from "../../ta/custom";
import { iMomentum, iMomentumOnArray as momentumOnArray } from "../../ta/momentum";
import { iStdDev, iStdDevOnArray as stdDevOnArray } from "../../ta/stddev";
import { iBands, iBandsOnArray } from "../../ta/bands";
import { iCCI, iCCIOnArray as cciOnArray } from "../../ta/cci";
import { iOBV } from "../../ta/obv";
import { iStochastic } from "../../ta/stochastic";

export function createIndicators(context: ExecutionContext): Record<string, BuiltinFunction> {
  return {
    iMA: (
      symbol: string,
      timeframe: number,
      period: number,
      maShift: number,
      maMethod: number,
      applied: number,
      shift: number
    ) => iMA(context, symbol, timeframe, period, maShift, maMethod, applied, shift),

    iMACD: (
      symbol: string,
      timeframe: number,
      fast: number,
      slow: number,
      signal: number,
      applied: number,
      mode: number,
      shift: number
    ) => iMACD(context, symbol, timeframe, fast, slow, signal, applied, mode, shift),

    iATR: (symbol: string, timeframe: number, period: number, shift: number) =>
      iATR(context, symbol, timeframe, period, shift),

    iRSI: (symbol: string, timeframe: number, period: number, applied: number, shift: number) =>
      iRSI(context, symbol, timeframe, period, applied, shift),

    iCustom: (symbol: string, timeframe: number, name: string, ...args: any[]) =>
      iCustom(context, symbol, timeframe, name, ...args),

    // その他のインジケーター関数（簡易実装）
    iAC: (symbol: string, timeframe: number, shift: number) => 0,
    iAD: (symbol: string, timeframe: number, shift: number) => 0,
    iADX: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      mode: number,
      shift: number
    ) => 0,
    iAlligator: (
      symbol: string,
      timeframe: number,
      jaw_period: number,
      jaw_shift: number,
      teeth_period: number,
      teeth_shift: number,
      lips_period: number,
      lips_shift: number,
      ma_method: number,
      applied_price: number,
      mode: number,
      shift: number
    ) => 0,
    iAO: (symbol: string, timeframe: number, shift: number) => 0,
    iBands: (
      symbol: string,
      timeframe: number,
      period: number,
      deviation: number,
      bands_shift: number,
      applied_price: number,
      mode: number,
      shift: number
    ) =>
      iBands(
        context,
        symbol,
        timeframe,
        period,
        deviation,
        bands_shift,
        applied_price,
        mode,
        shift
      ),
    iBandsOnArray: (
      array: number[],
      total: number,
      period: number,
      deviation: number,
      bands_shift: number,
      mode: number,
      shift: number
    ) => iBandsOnArray(array, total, period, deviation, bands_shift, mode, shift),
    iBearsPower: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iBullsPower: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iBWMFI: (symbol: string, timeframe: number, shift: number) => 0,
    iCCI: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => iCCI(context, symbol, timeframe, period, applied_price, shift),
    iCCIOnArray: (array: number[], total: number, period: number, shift: number) =>
      cciOnArray(array, total, period, shift),
    iDeMarker: (symbol: string, timeframe: number, period: number, shift: number) => 0,
    iEnvelopes: (
      symbol: string,
      timeframe: number,
      ma_period: number,
      ma_shift: number,
      ma_method: number,
      applied_price: number,
      deviation: number,
      mode: number,
      shift: number
    ) => 0,
    iEnvelopesOnArray: (
      array: number[],
      total: number,
      ma_period: number,
      ma_shift: number,
      ma_method: number,
      deviation: number,
      mode: number,
      shift: number
    ) => 0,
    iForce: (
      symbol: string,
      timeframe: number,
      period: number,
      ma_method: number,
      applied_price: number,
      shift: number
    ) => 0,
    iFractals: (symbol: string, timeframe: number, mode: number, shift: number) => 0,
    iGator: (
      symbol: string,
      timeframe: number,
      jaw_period: number,
      jaw_shift: number,
      teeth_period: number,
      teeth_shift: number,
      lips_period: number,
      lips_shift: number,
      ma_method: number,
      applied_price: number,
      mode: number,
      shift: number
    ) => 0,
    iIchimoku: (
      symbol: string,
      timeframe: number,
      tenkan_sen: number,
      kijun_sen: number,
      senkou_span_b: number,
      mode: number,
      shift: number
    ) => 0,
    iMAOnArray: (
      array: number[],
      total: number,
      period: number,
      ma_shift: number,
      ma_method: number,
      shift: number
    ) => maOnArray(array, total, period, ma_shift, ma_method, shift),
    iMFI: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iMomentum: (
      symbol: string,
      timeframe: number,
      period: number,
      applied_price: number,
      shift: number
    ) => iMomentum(context, symbol, timeframe, period, applied_price, shift),
    iMomentumOnArray: (array: number[], total: number, period: number, shift: number) =>
      momentumOnArray(array, total, period, shift),
    iOBV: (symbol: string, timeframe: number, applied_price: number, shift: number) =>
      iOBV(context, symbol, timeframe, applied_price, shift),
    iOsMA: (
      symbol: string,
      timeframe: number,
      fast_ema_period: number,
      slow_ema_period: number,
      signal_period: number,
      applied_price: number,
      shift: number
    ) => 0,
    iRSIOnArray: (array: number[], total: number, period: number, shift: number) =>
      rsiOnArray(array, total, period, shift),
    iRVI: (symbol: string, timeframe: number, period: number, mode: number, shift: number) => 0,
    iSAR: (symbol: string, timeframe: number, step: number, maximum: number, shift: number) => 0,
    iStdDev: (
      symbol: string,
      timeframe: number,
      ma_period: number,
      ma_shift: number,
      ma_method: number,
      applied_price: number,
      shift: number
    ) => iStdDev(context, symbol, timeframe, ma_period, ma_shift, ma_method, applied_price, shift),
    iStdDevOnArray: (
      array: number[],
      total: number,
      ma_period: number,
      ma_shift: number,
      ma_method: number,
      shift: number
    ) => stdDevOnArray(array, total, ma_period, ma_shift, ma_method, shift),
    iStochastic: (
      symbol: string,
      timeframe: number,
      k_period: number,
      d_period: number,
      slowing: number,
      method: number,
      price_field: number,
      mode: number,
      shift: number
    ) =>
      iStochastic(
        context,
        symbol,
        timeframe,
        k_period,
        d_period,
        slowing,
        method,
        price_field,
        mode,
        shift
      ),
    iWPR: (symbol: string, timeframe: number, period: number, shift: number) => 0,
  };
}
