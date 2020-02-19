import { expect } from 'chai'

import { AstNode, BinaryOperation, evaluateAst, NodeType } from '../../src/ai/ast'
import { createState, State } from '../../src/game/model'

describe('AST', () => {
  it('..', () => {
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
})
