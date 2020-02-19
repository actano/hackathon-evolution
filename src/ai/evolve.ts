import assert from 'assert'
import { AstAi, AstNode, NodeType } from './ast'

const GET_RANDOM_THRESHOLD = 0.2
const SET_RANDOM_THRESHOLD = 0.1

function assertNever(x: never) {
  assert(false, 'should not be called')
}

function getRandomSubtree(rand: RandomNumberGenerator, ast: AstNode): AstNode {
  const shouldReturn = rand() < GET_RANDOM_THRESHOLD

  if (shouldReturn) {
    return ast
  }

  switch (ast.type) {
    case NodeType.NumberLiteral:
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
  rand: RandomNumberGenerator
}

function recombine(rand : RandomNumberGenerator, a : AstAi, b : AstAi): AstAi {
  const source = getRandomSubtree(rand, a.ast)

  return {
    ...b,
    ast: setRandomSubtree(rand, b.ast, source),
  }
}

export function createEvolver(rand: RandomNumberGenerator): Evolver {
  return {
    recombine(a : AstAi, b : AstAi) : AstAi {
      return recombine(rand, a, b)
    },
    rand,
  }
}

