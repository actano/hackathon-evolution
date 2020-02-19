import { expect } from 'chai'

import { createEvolver, generateRandomAst, RandomNumberGenerator } from '../../src/ai/evolve'
import { AstAi, astBinOp, astNum, BinaryOperation, createAstAi } from '../../src/ai/ast'

function createRng(source: number[]): RandomNumberGenerator {
  let currentPos = 0

  return () => {
    const result = source[currentPos]
    currentPos = (currentPos + 1) % source.length
    return result
  }
}

describe('Evolver', () => {
  it('should recombine', () => {
    const rand = createRng([
      1,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
    ])

    const a: AstAi = createAstAi(
      astBinOp(
        BinaryOperation.Plus,
        astBinOp(
          BinaryOperation.Multiply,
          astNum(10),
          astNum(4),
        ),
        astNum(123),
      ),
    )

    const b: AstAi = createAstAi(
      astBinOp(
        BinaryOperation.Plus,
        astNum(123),
        astBinOp(
          BinaryOperation.Multiply,
          astNum(10),
          astNum(4),
        ),
      ),
    )

    const evolver = createEvolver(rand)
    const child = evolver.recombine(a, b)
    expect(child.ast).to.deep.equal(
      astBinOp(
        BinaryOperation.Plus,
        astNum(123),
        astBinOp(
          BinaryOperation.Multiply,
          astNum(10),
          astBinOp(
            BinaryOperation.Multiply,
            astNum(10),
            astNum(4),
          ),
        ),
      ),
    )
  })

  it('should generate a random AST', () => {
    const rand = createRng([
      0.3,
      0,
      0,
      (123 + 999) / (999 + 999),
      0.3,
      0.5,
      0,
      (10 + 999) / (999 + 999),
      0.3,
      0.5,
      0,
      (10 + 999) / (999 + 999),
      0,
      (5 + 999) / (999 + 999),
    ])

    const ast = generateRandomAst(rand, 0)

    expect(ast).to.deep.equal(
      astBinOp(
        BinaryOperation.Plus,
        astNum(123),
        astBinOp(
          BinaryOperation.Multiply,
          astNum(10),
          astBinOp(
            BinaryOperation.Multiply,
            astNum(10),
            astNum(5),
          ),
        ),
      ),
    )
  })
})
