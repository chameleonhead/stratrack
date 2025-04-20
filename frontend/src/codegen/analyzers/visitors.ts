import { BarExpression, CommonCondition, ScalarExpression } from "../dsl/common";

export type Visitor = (expr: ScalarExpression | BarExpression) => void;

export function visitScalarExpression(expr: ScalarExpression, visitor: Visitor) {
  visitor(expr);
  switch (expr.type) {
    case "unary_op":
      visitScalarExpression(expr.operand, visitor);
      break;
    case "binary_op":
      visitScalarExpression(expr.left, visitor);
      visitScalarExpression(expr.right, visitor);
      break;
    case "ternary":
      visitCondition(expr.condition, visitor);
      visitScalarExpression(expr.trueExpr, visitor);
      visitScalarExpression(expr.falseExpr, visitor);
      break;
    case "aggregation":
      visitScalarExpression(expr.period, visitor);
      break;
    case "bar_value":
      if (expr.fallback) visitScalarExpression(expr.fallback, visitor);
      break;
    case "scalar_price":
      if (expr.fallback) visitScalarExpression(expr.fallback, visitor);
      break;
  }
}

export function visitCondition(
  cond: CommonCondition,
  visitor: Visitor,
) {
  switch (cond.type) {
    case "comparison":
      visitScalarExpression(cond.left, visitor);
      visitScalarExpression(cond.right, visitor);
      break;
    case "cross":
      if (cond.left.type === "constant") {
        visitScalarExpression(cond.left, visitor);
      } else {
        visitor(cond.left);
      }
      if (cond.right.type === "constant") {
        visitScalarExpression(cond.right, visitor);
      } else {
        visitor(cond.right);
      }
      break;
    case "state":
      visitor(cond.operand);
      break;
    case "change":
    case "continue":
      visitCondition(cond.condition, visitor);
      break;
    case "group":
      cond.conditions.forEach((c) => visitCondition(c, visitor));
      break;
  }
} 
