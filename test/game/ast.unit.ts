import { expect } from 'chai'

import {
  AstNode,
  BinaryOperation,
  evaluate,
  evaluateAst,
  FALSE,
  NodeType,
  TRUE
} from '../../src/ai/ast'
import { createState, Direction, State } from '../../src/game/model'

describe('AST', () => {
  it('should evaluate an AST', () => {
    const tree: AstNode =  {
      type: NodeType.BinaryOp,
      operation: BinaryOperation.Plus,
      lvalue: {
        type: NodeType.NumberLiteral,
        value: 12,
      },
      rvalue: {
        type: NodeType.BinaryOp,
        operation: BinaryOperation.Multiply,
        lvalue: {
          type: NodeType.NumberLiteral,
          value: 3,
        },
        rvalue: {
          type: NodeType.NumberLiteral,
          value: 10,
        },
      },
    }

    const state: State = createState(10, 10, 3)

    const result = evaluateAst(tree, state)

    expect(result).to.equal(42)
  })

  it('should evaluate an AST to a direction', () => {
    const tree: AstNode =  {
      type: NodeType.BinaryOp,
      operation: BinaryOperation.Plus,
      lvalue: {
        type: NodeType.NumberLiteral,
        value: 12.4,
      },
      rvalue: {
        type: NodeType.BinaryOp,
        operation: BinaryOperation.Multiply,
        lvalue: {
          type: NodeType.NumberLiteral,
          value: 3,
        },
        rvalue: {
          type: NodeType.NumberLiteral,
          value: 10,
        },
      },
    }

    const state: State = createState(10, 10, 3)

    const result: Direction = evaluate(tree, state)

    expect(result).to.equal(Direction.Down)
  })

  it('should evaluate field access', () => {
    const tree: AstNode =  {
      type: NodeType.GetField,
      x: {
        type: NodeType.NumberLiteral,
        value: 5,
      },
      y: {
        type: NodeType.NumberLiteral,
        value: 5,
      },
    }

    const state: State = createState(10, 10, 3)

    const result: number = evaluateAst(tree, state)

    expect(result).to.equal(3)
  })

  it('should evaluate if expression with true condition', () => {
    const tree: AstNode =  {
      type: NodeType.If,
      condition: {
        type: NodeType.NumberLiteral,
        value: 1234,
      },
      then: {
        type: NodeType.NumberLiteral,
        value: 42,
      },
      else: {
        type: NodeType.NumberLiteral,
        value: 24,
      },
    }

    const state: State = createState(10, 10, 3)

    const result: number = evaluateAst(tree, state)

    expect(result).to.equal(42)
  })

  it('should evaluate if expression with false condition', () => {
    const tree: AstNode =  {
      type: NodeType.If,
      condition: {
        type: NodeType.NumberLiteral,
        value: 0,
      },
      then: {
        type: NodeType.NumberLiteral,
        value: 42,
      },
      else: {
        type: NodeType.NumberLiteral,
        value: 24,
      },
    }

    const state: State = createState(10, 10, 3)

    const result: number = evaluateAst(tree, state)

    expect(result).to.equal(24)
  })

  it('should evaluate true equals expression', () => {
    const tree: AstNode =  {
      type: NodeType.BinaryOp,
      operation: BinaryOperation.Equals,
      lvalue: {
        type: NodeType.NumberLiteral,
        value: 42.1,
      },
      rvalue: {
        type: NodeType.NumberLiteral,
        value: 42.1234,
      }
    }

    const state: State = createState(10, 10, 3)

    const result: number = evaluateAst(tree, state)

    expect(result).to.equal(TRUE)
  })

  it('should evaluate false equals expression', () => {
    const tree: AstNode =  {
      type: NodeType.BinaryOp,
      operation: BinaryOperation.Equals,
      lvalue: {
        type: NodeType.NumberLiteral,
        value: 42.1,
      },
      rvalue: {
        type: NodeType.NumberLiteral,
        value: -10,
      }
    }

    const state: State = createState(10, 10, 3)

    const result: number = evaluateAst(tree, state)

    expect(result).to.equal(FALSE)
  })
})
