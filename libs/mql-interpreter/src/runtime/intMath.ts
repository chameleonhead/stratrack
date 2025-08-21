const toBigInt = (value: any): bigint => {
  if (typeof value === "bigint") return value;
  return BigInt(Math.trunc(Number(value)));
};

export function toInt32(value: any): number {
  return Number(BigInt.asIntN(32, toBigInt(value)));
}

export function toUInt32(value: any): number {
  return Number(BigInt.asUintN(32, toBigInt(value)));
}

export function toInt64(value: any): bigint {
  return BigInt.asIntN(64, toBigInt(value));
}

export function toUInt64(value: any): bigint {
  return BigInt.asUintN(64, toBigInt(value));
}

export function intBinaryOp(op: string, a: any, b: any, bits: 32 | 64, unsigned = false): any {
  const A = BigInt(a);
  const B = BigInt(b);
  let result: bigint;
  switch (op) {
    case "+":
      result = A + B;
      break;
    case "-":
      result = A - B;
      break;
    case "*":
      result = A * B;
      break;
    case "/":
      result = B === 0n ? 0n : A / B;
      break;
    case "%":
      result = B === 0n ? 0n : A % B;
      break;
    case "<<":
      result = A << B;
      break;
    case ">>":
      result = A >> B;
      break;
    case "&":
      result = A & B;
      break;
    case "|":
      result = A | B;
      break;
    case "^":
      result = A ^ B;
      break;
    default:
      throw new Error(`Unsupported op ${op}`);
  }
  if (bits === 32) {
    return unsigned ? toUInt32(result) : toInt32(result);
  } else {
    return unsigned ? toUInt64(result) : toInt64(result);
  }
}
