import { expect } from 'chai'

import {
  astBinOp,
  AstNode,
  astNum,
  BinaryOperation,
  deserializeFromFile,
  evaluateAst,
  serializeToFile,
} from '../../src/ai/ast'
import { createState, State } from '../../src/game/model'

describe('serialization of AST', () => {
  it('should store and read AST', () => {
    const ast: AstNode = astBinOp(
      BinaryOperation.Plus,
      astNum(12),
      astBinOp(
        BinaryOperation.Multiply,
        astNum(20),
        astNum(10),
      )
    )

    const state: State = createState(10, 10, 3)

    serializeToFile('test.ast.json', ast)
    const loadedAst = deserializeFromFile('test.ast.json')

    expect(loadedAst).to.deep.equal(ast)
    expect(evaluateAst(loadedAst, state)).to.equal(212)
  })
})
