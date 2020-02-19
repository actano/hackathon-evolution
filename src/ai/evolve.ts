import {
  AstAi,
  AstBinaryOp,
  AstGetField,
  AstGetFieldInFront,
  AstGetX, AstGetY,
  AstIf,
  AstNode,
  AstNumberLiteral,
  BinaryOperation,
  createAstAi,
  NodeType
} from './ast'
import { assertNever } from '../util'

const GET_RANDOM_THRESHOLD = 0.2
const SET_RANDOM_THRESHOLD = 0.25

const MIN_LITERAL_NUMBER = -999
const MAX_LITERAL_NUMBER = 999

const RANDOM_AST_DEPTH_THRESHOLD = 1

function getRandomSubtree(rand: RandomNumberGenerator, ast: AstNode): AstNode {
  const shouldReturn = rand() < GET_RANDOM_THRESHOLD

  if (shouldReturn) {
    return ast
  }

  switch (ast.type) {
    case NodeType.NumberLiteral:
    case NodeType.GetFieldInFront:
    case NodeType.GetX:
    case NodeType.GetY:
      return ast
    case NodeType.BinaryOp:
      return rand() < 0.5
        ? getRandomSubtree(rand, ast.lvalue)
        : getRandomSubtree(rand, ast.rvalue)
    case NodeType.If: {
      const r = rand()

      if (r < 0.33) {
        return getRandomSubtree(rand, ast.condition)
      } else if (r < 0.66) {
        return getRandomSubtree(rand, ast.then)
      } else {
        return getRandomSubtree(rand, ast.else)
      }
    }
    case NodeType.GetField:
      return rand() < 0.5
        ? getRandomSubtree(rand, ast.x)
        : getRandomSubtree(rand, ast.y)
    default:
      assertNever(ast)
  }
}

function setRandomSubtree(rand: RandomNumberGenerator, target: AstNode, source: AstNode): AstNode {
  const shouldReturn = rand() < SET_RANDOM_THRESHOLD

  if (shouldReturn) {
    return source
  }

  switch (target.type) {
    case NodeType.NumberLiteral:
    case NodeType.GetFieldInFront:
    case NodeType.GetX:
    case NodeType.GetY:
      return source
    case NodeType.BinaryOp:
      if (rand() < 0.5) {
        return {
          ...target,
          lvalue: setRandomSubtree(rand, target.lvalue, source)
        }
      } else {
        return {
          ...target,
          rvalue: setRandomSubtree(rand, target.rvalue, source)
        }
      }
    case NodeType.If: {
      const r = rand()

      if (r < 0.33) {
        return {
          ...target,
          condition: setRandomSubtree(rand, target.condition, source),
        }
      } else if (r < 0.66) {
        return {
          ...target,
          then: setRandomSubtree(rand, target.then, source),
        }
      } else {
        return {
          ...target,
          else: setRandomSubtree(rand, target.else, source),
        }
      }
    }
    case NodeType.GetField:
      if (rand() < 0.5) {
        return {
          ...target,
          x: setRandomSubtree(rand, target.x, source),
        }
      } else {
        return {
          ...target,
          y: setRandomSubtree(rand, target.y, source),
        }
      }
    default:
      assertNever(target)
  }
}

export type RandomNumberGenerator = () => number

export interface Evolver {
  recombine(a: AstAi, b: AstAi): AstAi,
  mutate(ai: AstAi): AstAi,
}

type AstGenerator = (rand: RandomNumberGenerator, depth: number) => AstNode

function randomNumberBetween(rand: RandomNumberGenerator, min: number, max: number): number {
  return rand() * (max - min) + min
}

function randomIntegerBetween(rand: RandomNumberGenerator, min: number, max: number): number {
  return Math.floor(randomNumberBetween(rand, min, max))
}

export function getRandomElement<T>(rand: RandomNumberGenerator, list: T[]): T {
  const index = randomIntegerBetween(rand, 0, list.length)
  return list[index]
}

function generateRandomNumberLiteral(rand: RandomNumberGenerator): AstNumberLiteral {
  return {
    type: NodeType.NumberLiteral,
    value: randomNumberBetween(rand, MIN_LITERAL_NUMBER, MAX_LITERAL_NUMBER)
  }
}

function generateRandomBinaryOp(rand: RandomNumberGenerator, depth: number): AstBinaryOp {
  const operation = getRandomElement(rand, Object.keys(BinaryOperation).map(key => BinaryOperation[key]))
  const lvalue = generateRandomAst(rand, depth + 1)
  const rvalue = generateRandomAst(rand, depth + 1)
  return {
    type: NodeType.BinaryOp,
    operation,
    lvalue,
    rvalue,
  }
}

function generateRandomIf(rand: RandomNumberGenerator, depth: number): AstIf {
  const condition = generateRandomAst(rand, depth + 1)
  const then = generateRandomAst(rand, depth + 1)
  const els = generateRandomAst(rand, depth + 1)

  return {
    type: NodeType.If,
    condition,
    then,
    else: els,
  }
}

function generateRandomGetField(rand: RandomNumberGenerator, depth: number): AstGetField {
  const x = generateRandomAst(rand, depth + 1)
  const y = generateRandomAst(rand, depth + 1)

  return {
    type: NodeType.GetField,
    x,
    y,
  }
}

function generateRandomGetFieldInFront(rand: RandomNumberGenerator): AstGetFieldInFront {
  return {
    type: NodeType.GetFieldInFront,
  }
}

function generateRandomGetX(rand: RandomNumberGenerator): AstGetX {
  return {
    type: NodeType.GetX,
  }
}

function generateRandomGetY(rand: RandomNumberGenerator): AstGetY {
  return {
    type: NodeType.GetY,
  }
}

const AST_GENERATORS: AstGenerator[] = [
  generateRandomNumberLiteral,
  generateRandomBinaryOp,
  generateRandomIf,
  generateRandomGetField,
  generateRandomGetFieldInFront,
  generateRandomGetX,
  generateRandomGetY,
]

export function generateRandomAst(rand: RandomNumberGenerator, depth: number): AstNode {
  if (depth > RANDOM_AST_DEPTH_THRESHOLD) {
    return generateRandomNumberLiteral(rand)
  }

  const generator = getRandomElement(rand, AST_GENERATORS)
  return generator(rand, depth)
}

function recombine(rand : RandomNumberGenerator, a : AstAi, b : AstAi): AstAi {
  const source = getRandomSubtree(rand, a.ast)

  return {
    ...b,
    ast: setRandomSubtree(rand, b.ast, source),
  }
}

function mutate(rand : RandomNumberGenerator, ai : AstAi) {
  const mutation = generateRandomAst(rand, 0)
  return {
    ...ai,
    ast: setRandomSubtree(rand, ai.ast, mutation),
  }
}

export function createEvolver(rand: RandomNumberGenerator): Evolver {
  return {
    recombine(a : AstAi, b : AstAi) : AstAi {
      return recombine(rand, a, b)
    },
    mutate(ai: AstAi): AstAi {
      return mutate(rand, ai)
    },
  }
}

export function createRandomAstAi(rand: RandomNumberGenerator): AstAi {
  const ast = generateRandomAst(rand, 0)
  return createAstAi(ast)
}

