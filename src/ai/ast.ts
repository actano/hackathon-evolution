import assert from 'assert'
import { Direction, State } from '../game/model'

export enum NodeType {
  NumberLiteral = 'NumberLiteral',
  BinaryOp = 'BinaryOp',
}

export enum BinaryOperation {
  Plus = '+',
  Multiply = '*',
}

export interface AstNumberLiteral {
  type: NodeType.NumberLiteral,
  value: number,
}

export interface AstBinaryOp {
  type: NodeType.BinaryOp,
  lvalue: AstNode,
  rvalue: AstNode,
  operation: BinaryOperation,
}

export type AstNode = AstNumberLiteral | AstBinaryOp


function evaluateBinary(node: AstBinaryOp, state: State) {
  const leftNumber = evaluateAst(node.lvalue, state)
  const rightNumber = evaluateAst(node.rvalue, state)

  switch (node.operation) {
    case BinaryOperation.Plus: {
      return leftNumber + rightNumber
    }
    case BinaryOperation.Multiply: {
      return leftNumber * rightNumber
    }
    default:
      assert(false, `cannot evaluate binary operation ${node.operation}`)
  }
}

export function evaluateAst(node: AstNode, state: State): number {
  switch (node.type) {
    case NodeType.NumberLiteral:
      return node.value
    case NodeType.BinaryOp:
      return evaluateBinary(node, state)
    default:
      assert(false, `cannot evaluate Ast Node ${node}`)
  }
}

export function evaluate(node: AstNode, state: State): Direction {
  const numberValue = evaluateAst(node, state)
  const nonNegativeInteger = Math.abs(Math.round(numberValue))
  switch (nonNegativeInteger % 4) {
    case 0:
      return Direction.Up
    case 1:
      return Direction.Right
    case 2:
      return Direction.Down
    case 3:
      return Direction.Left
  }
  assert(false, 'invalid direction')
}