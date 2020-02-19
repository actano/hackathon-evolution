import { expect } from 'chai'

import { createState, Direction, FieldContent, getField, isGameOver, move, State, stateToString } from '../../src/game/model'

describe('State', () => {
  it('should create initial board', () => {
    const state: State = createState(10, 20, 5)

    expect(getField(state, 0, 0)).to.equal(FieldContent.Wall)
    expect(getField(state, 5, 10)).to.equal(FieldContent.SnakeHead)
    expect(getField(state, 5, 5)).to.equal(FieldContent.Nothing)
    expect(getField(state, 5, 6)).to.equal(FieldContent.SnakeTail)
    expect(getField(state, 2, 3)).to.equal(FieldContent.Nothing)

    expect(stateToString(state)).to.equal(`[=][=][=][=][=][=][=][=][=][=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [+]         [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=][=][=][=][=][=][=][=][=][=]
`)
  })

  context('move', () => {
    context('without collision', () => {
      it('should move down', () => {
        const state: State = createState(10, 10, 5)
        const newState = move(state, Direction.Down)

        expect(isGameOver(newState)).to.equal(false)
        expect(stateToString(newState)).to.equal(`[=][=][=][=][=][=][=][=][=][=]
[=]                        [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [+]         [=]
[=]                        [=]
[=]                        [=]
[=][=][=][=][=][=][=][=][=][=]
`)

      })
      it('should move right', () => {
        const state: State = createState(10, 10, 5)
        const newState = move(state, Direction.Right)

        expect(isGameOver(newState)).to.equal(false)
        expect(stateToString(newState)).to.equal(`[=][=][=][=][=][=][=][=][=][=]
[=]                        [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [-][+]      [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=][=][=][=][=][=][=][=][=][=]
`)
      })
      it('should move left', () => {
        const state: State = createState(10, 10, 5)
        const newState = move(state, Direction.Left)

        expect(isGameOver(newState)).to.equal(false)
        expect(stateToString(newState)).to.equal(`[=][=][=][=][=][=][=][=][=][=]
[=]                        [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]         [+][-]         [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=][=][=][=][=][=][=][=][=][=]
`)
      })
      it('should move up', () => {
        const state: State = createState(10, 10, 5)
        const newState = move(state, Direction.Left)
        const newState2 = move(newState, Direction.Up)

        expect(isGameOver(newState)).to.equal(false)
        expect(stateToString(newState2)).to.equal(`[=][=][=][=][=][=][=][=][=][=]
[=]                        [=]
[=]                        [=]
[=]            [-]         [=]
[=]         [+][-]         [=]
[=]         [-][-]         [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=][=][=][=][=][=][=][=][=][=]
`)
      })
    })
    context('with collision', () => {
      it('should fail when moving up', () => {
        const state: State = createState(10, 10, 5)
        const newState = move(state, Direction.Up)

        expect(isGameOver(newState)).to.equal(true)
      })
    })
  })
})
