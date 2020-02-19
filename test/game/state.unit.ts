import { expect } from 'chai'

import { createState, FieldContent, getField, State, stateToString } from '../../src/game'

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
})
