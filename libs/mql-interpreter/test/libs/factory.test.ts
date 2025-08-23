import { describe, it, expect } from "vitest";
import { createLibs } from "../../src/libs";
import { InMemoryBroker } from "../../src/libs/domain/broker";
import { InMemoryAccount } from "../../src/libs/domain/account";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";

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
});
