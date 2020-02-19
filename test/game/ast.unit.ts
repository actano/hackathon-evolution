import { expect } from 'chai'

import { AstNode, BinaryOperation, evaluate, evaluateAst, NodeType } from '../../src/ai/ast'
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
})
