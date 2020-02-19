import assert from 'assert'
import fs from 'fs'
import { Direction, FieldContent, getField, getFieldP, State } from '../game/model'
import { Ai } from '../game/execution'
import { assertNever } from '../util'

export const FALSE = 0
export const TRUE = 1
const DELTA_EQ = 0.1

export enum NodeType {
  NumberLiteral = 'NumberLiteral',
  BinaryOp = 'BinaryOp',
  GetField = 'GetField',
  If = 'If',
  GetFieldInFront = 'GetFieldInFront',
  GetX = 'GetX',
  GetY = 'GetY',
}

export enum BinaryOperation {
  Plus = '+',
  Multiply = '*',
  Equals = '==',
  Less = '<',
  LessEq = '<=',
  Greater = '>',
  GreaterEq = '>=',
  And = '&&',
  Or = '||',
}

export interface AstNumberLiteral {
  type: NodeType.NumberLiteral,
  value: number,
}

export function astNum(value: number): AstNumberLiteral {
  return {
    type: NodeType.NumberLiteral,
    value,
  }
}

export interface AstBinaryOp {
  type: NodeType.BinaryOp,
  lvalue: AstNode,
  rvalue: AstNode,
  operation: BinaryOperation,
}

export function astBinOp(operation: BinaryOperation, lvalue: AstNode, rvalue: AstNode): AstBinaryOp {
  return {
    type: NodeType.BinaryOp,
    operation,
    lvalue,
    rvalue,
  }
}

export interface AstGetField {
  type: NodeType.GetField,
  x: AstNode,
  y: AstNode,
}

export function astGetField(x: AstNode, y: AstNode): AstGetField {
  return {
    type: NodeType.GetField,
    x,
    y,
  }
}

export interface AstIf {
  type: NodeType.If,
  condition: AstNode,
  then: AstNode,
  else: AstNode,
}

export function astIf(condition: AstNode, then: AstNode, els: AstNode): AstIf {
  return {
    type: NodeType.If,
    condition,
    then,
    else: els,
  }
}

export interface AstGetFieldInFront {
  type: NodeType.GetFieldInFront,
}

export interface AstGetX {
  type: NodeType.GetX,
}

export interface AstGetY {
  type: NodeType.GetY,
}

export type AstNode = AstNumberLiteral | AstBinaryOp | AstGetField | AstIf | AstGetFieldInFront |
  AstGetX | AstGetY

function deltaEq(a: number, b: number): boolean {
  return Math.abs(a - b) < DELTA_EQ
}

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
    case BinaryOperation.Equals:
      return deltaEq(leftNumber, rightNumber) ? TRUE : FALSE
    case BinaryOperation.And:
      return (deltaEq(leftNumber, TRUE) && deltaEq(rightNumber, TRUE)) ? TRUE : FALSE
    case BinaryOperation.Or:
      return (deltaEq(leftNumber, TRUE) || deltaEq(rightNumber, TRUE)) ? TRUE : FALSE
    case BinaryOperation.Less:
      return (leftNumber < rightNumber) ? TRUE : FALSE
    case BinaryOperation.LessEq:
      return ((leftNumber < rightNumber) || deltaEq(leftNumber, rightNumber)) ? TRUE: FALSE

    case BinaryOperation.Greater:
      return leftNumber > rightNumber ? TRUE : FALSE
    case BinaryOperation.GreaterEq:
      return ((leftNumber > rightNumber) || deltaEq(leftNumber, rightNumber)) ? TRUE : FALSE
    default:
      assertNever(node.operation)
  }
}

function normalizeNumber(n: number, max: number): number {
  return Math.abs(Math.round(n)) % max
}

function fieldToNumber(field: FieldContent): number {
  const values = Object.keys(FieldContent).map(key => FieldContent[key])
  return values.indexOf(field)
}

function evaluateGetField(node : AstGetField, state : State): number {
  const x = normalizeNumber(evaluateAst(node.x, state), state.sizeX)
  const y = normalizeNumber(evaluateAst(node.y, state), state.sizeY)
  const field = getField(state, x, y)
  return fieldToNumber(field)
}

function evaluateIf(node : AstIf, state : State): number {
  const conditionValue = evaluateAst(node.condition, state)

  if (conditionValue !== FALSE) {
    return evaluateAst(node.then, state)
  } else {
    return evaluateAst(node.else, state)
  }
}

function evaluateGetFieldInFront(state : State): number {
  assert(state.snake.length >= 2)
  const headPosition = state.snake[0]
  const previousHeadPosition = state.snake[1]

  if (headPosition.x < previousHeadPosition.x) {
    return fieldToNumber(getField(state, headPosition.x - 1, headPosition.y))
  } else if (headPosition.x > previousHeadPosition.x) {
    return fieldToNumber(getField(state, headPosition.x + 1, headPosition.y))
  }

  if (headPosition.y < previousHeadPosition.y) {
    return fieldToNumber(getField(state, headPosition.x, headPosition.y - 1))
  } else if (headPosition.y > previousHeadPosition.y) {
    return fieldToNumber(getField(state, headPosition.x, headPosition.y + 1))
  }

  assert(false, 'invalid snake state')
}

function evaluateGetX(state : State): number {
  assert(state.snake.length > 0)
  return state.snake[0].x
}

function evaluateGetY(state : State): number {
  assert(state.snake.length > 0)
  return state.snake[0].y
}

export function evaluateAst(node: AstNode, state: State): number {
  switch (node.type) {
    case NodeType.NumberLiteral:
      return node.value
    case NodeType.BinaryOp:
      return evaluateBinary(node, state)
    case NodeType.GetField:
      return evaluateGetField(node, state)
    case NodeType.If:
      return evaluateIf(node, state)
    case NodeType.GetFieldInFront:
      return evaluateGetFieldInFront(state)
    case NodeType.GetX:
      return evaluateGetX(state)
    case NodeType.GetY:
      return evaluateGetY(state)
    default:
      assertNever(node)
  }
}

export function evaluate(node: AstNode, state: State): Direction {
  const numberValue = evaluateAst(node, state)
  switch (normalizeNumber(numberValue, 4)) {
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

export interface AstAi extends Ai {
  ast: AstNode
}

export function createAstAi(ast: AstNode): AstAi {
  return {
    step(state : State) : Direction {
      return evaluate(ast, state)
    },
    ast,
  }
}

export function serializeToFile(filename: string, node: AstNode): void {
  const string = JSON.stringify(node, null, 2)
  fs.writeFileSync(filename, string, 'utf8')
}

export function deserializeFromFile(filename: string): AstNode {
  const string = fs.readFileSync(filename, 'utf8')
  return JSON.parse(string) as AstNode
}
