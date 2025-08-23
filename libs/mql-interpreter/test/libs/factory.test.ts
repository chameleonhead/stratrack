import { describe, it, expect } from "vitest";
import { createLibs } from "../../src/libs";
import { InMemoryBroker } from "../../src/libs/domain/broker";
import { InMemoryAccount } from "../../src/libs/domain/account";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import { InMemoryIndicatorEngine } from "../../src/libs/domain/indicator";

describe("createLibs", () => {
  it("routes trading calls through the provided broker", () => {
    const broker = new InMemoryBroker();
    const account = new InMemoryAccount();
    const market = new InMemoryMarketData({}, {});
    const libs = createLibs({ broker, account, market, terminal: null });
    libs.OrderSend("SYM", 0, 1, 1, 0, 0, 0);
    expect(broker.getOpenOrders().length).toBe(1);
  });

  it("exposes indicator helpers", () => {
    const broker = new InMemoryBroker();
    const account = new InMemoryAccount();
    const market = new InMemoryMarketData({}, {});
    const libs = createLibs({ broker, account, market, terminal: null });
    expect(typeof libs.iMA).toBe("function");
  });

  it("does not inherit indicator state from the input context", () => {
    const broker = new InMemoryBroker();
    const account = new InMemoryAccount();
    const market = new InMemoryMarketData({}, {});
    const libs: any = createLibs({
      broker,
      account,
      market,
      terminal: null,
      indicatorEngine: new InMemoryIndicatorEngine(),
      hideTestIndicators: true,
      indicatorBuffers: [[1]],
      indicatorCounted: 10,
      indicatorDigits: 8,
      indicatorShortName: "foo",
      indexArrows: { 0: 1 },
      indexDrawBegins: { 0: 1 },
      indexEmptyValues: { 0: 0 },
      indexLabels: { 0: "L" },
      indexShifts: { 0: 2 },
      indexStyles: { 0: { style: 1, width: 2, color: 3 } },
      levelStyles: { 0: { style: 1, width: 2, color: 3 } },
      levelValues: { 0: 42 },
    });
    const state = libs._getInternalState();
    expect(state.hideTestIndicators).toBe(false);
    expect(state.indicatorBuffers).toEqual([]);
    expect(state.indicatorCounted).toBe(0);
    expect(state.indicatorDigits).toBe(5);
    expect(state.indicatorShortName).toBe("");
    expect(state.indexArrows).toEqual({});
    expect(state.indexDrawBegins).toEqual({});
    expect(state.indexEmptyValues).toEqual({});
    expect(state.indexLabels).toEqual({});
    expect(state.indexShifts).toEqual({});
    expect(state.indexStyles).toEqual({});
    expect(state.levelStyles).toEqual({});
    expect(state.levelValues).toEqual({});
  });
});
