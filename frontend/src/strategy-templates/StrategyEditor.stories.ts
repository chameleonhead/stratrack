import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import StrategyEditor from "./StrategyEditor";

const meta = {
  component: StrategyEditor,
  args: { onChange: fn() },
} satisfies Meta<typeof StrategyEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};


export const RSI14: Story = {
  args: {
    value: {
      template: {
        variables: [
          {
            name: "rsi14",
            expression: {
              type: "indicator",
              name: "RSI",
              params: { period: 14 },
              source: {
                type: "price",
                source: "close"
              }
            }
          }
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: { type: "variable", name: "rsi14" },
              operator: "<",
              right: { type: "constant", value: 30 }
            }
          }
        ],
        exit: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: { type: "variable", name: "rsi14" },
              operator: ">",
              right: { type: "constant", value: 70 }
            }
          }
        ],
        riskManagement: {
          type: "fixed",
          lotSize: 1
        }
      }
    }
  }
}

export const DonchianChannel: Story = {
  args: {
    value: {
      template: {
        variables: [
          {
            name: "close",
            expression: {
              type: "price",
              source: "close"
            }
          },
          {
            name: "donchian_high",
            expression: {
              type: "indicator",
              name: "DonchianChannelHigh",
              params: { period: 20 },
              source: {
                type: "price",
                source: "high"
              }
            }
          },
          {
            name: "donchian_low",
            expression: {
              type: "indicator",
              name: "DonchianChannelLow",
              params: { period: 20 },
              source: {
                type: "price",
                source: "low"
              }
            }
          },
          {
            name: "donchian_mid",
            expression: {
              type: "binary_op",
              operator: "/",
              left: {
                type: "binary_op",
                operator: "+",
                left: {
                  type: "variable",
                  name: "donchian_high"
                },
                right: {
                  type: "variable",
                  name: "donchian_low"
                }
              },
              right: {
                type: "constant",
                value: 2
              }
            }
          }
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: {
                type: "variable",
                name: "close"
              },
              operator: ">",
              right: {
                type: "variable",
                name: "donchian_high"
              }
            }
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "variable",
                name: "close"
              },
              operator: "<",
              right: {
                type: "variable",
                name: "donchian_low"
              }
            }
          }
        ],
        exit: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: {
                type: "variable",
                name: "close"
              },
              operator: "<",
              right: {
                type: "variable",
                name: "donchian_mid"
              }
            }
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "variable",
                name: "close"
              },
              operator: ">",
              right: {
                type: "variable",
                name: "donchian_mid"
              }
            }
          }
        ],
        riskManagement: {
          type: "fixed",
          lotSize: 1
        },
        positionManagement: {
          trailingStop: {
            enabled: false,
            distance: null
          },
          takeProfit: {
            enabled: false,
            target: null
          },
          stopLoss: {
            enabled: false,
            limit: null
          }
        },
        environmentFilter: {
          trendCondition: false,
          volatilityCondition: false,
          avoidNews: false
        },
        timingControl: {
          allowedDays: ["mon", "tue", "wed", "thu", "fri"],
          allowedTimeRange: {
            from: "00:00",
            to: "23:59"
          }
        },
        multiPositionControl: {
          maxPositions: 1,
          allowHedging: false
        }
      }
    }
  }
}