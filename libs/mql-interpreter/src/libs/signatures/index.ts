import type { BuiltinSignaturesMap } from "./types";
export type { FunctionArg, FunctionSignature, BuiltinSignaturesMap } from "./types";

import { accountBuiltinSignatures } from "./account";
import { arrayBuiltinSignatures } from "./array";
import { chartOperationsBuiltinSignatures } from "./chartOperations";
import { checkBuiltinSignatures } from "./check";
import { commonBuiltinSignatures } from "./common";
import { convertBuiltinSignatures } from "./convert";
import { customindBuiltinSignatures } from "./customind";
import { dateandtimeBuiltinSignatures } from "./dateandtime";
import { filesBuiltinSignatures } from "./files";
import { globalsBuiltinSignatures } from "./globals";
import { marketinformationBuiltinSignatures } from "./marketInformation";
import { mathBuiltinSignatures } from "./math";
import { objectsBuiltinSignatures } from "./objects";
import { stringsBuiltinSignatures } from "./strings";
import { indicatorsBuiltinSignatures } from "./indicators";
import { seriesBuiltinSignatures } from "./series";
import { tradingBuiltinSignatures } from "./trading";
import { signalsBuiltinSignatures } from "./signals";
import { eventfunctionsBuiltinSignatures } from "./eventFunctions";

export const builtinSignatures: BuiltinSignaturesMap = {
  ...accountBuiltinSignatures,
  ...arrayBuiltinSignatures,
  ...chartOperationsBuiltinSignatures,
  ...checkBuiltinSignatures,
  ...commonBuiltinSignatures,
  ...convertBuiltinSignatures,
  ...customindBuiltinSignatures,
  ...dateandtimeBuiltinSignatures,
  ...filesBuiltinSignatures,
  ...globalsBuiltinSignatures,
  ...marketinformationBuiltinSignatures,
  ...mathBuiltinSignatures,
  ...objectsBuiltinSignatures,
  ...stringsBuiltinSignatures,
  ...indicatorsBuiltinSignatures,
  ...seriesBuiltinSignatures,
  ...tradingBuiltinSignatures,
  ...signalsBuiltinSignatures,
  ...eventfunctionsBuiltinSignatures,
};
