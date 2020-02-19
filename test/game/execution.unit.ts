import { expect } from 'chai'

import { createState, Direction, isGameOver, State, stateToString } from '../../src/game/model'
import { Ai, makeDirectionAi, run, RunResult } from '../../src/game/execution'

describe('Execution', () => {
  it('should end game after collision', () => {
    const state: State = createState(10, 10, 3)
    const ai: Ai = makeDirectionAi(Direction.Down)

    const result: RunResult = run(state, ai, 30)

    expect(result.round).to.equal(3)
    expect(isGameOver(result.endState)).to.equal(true)
    expect(stateToString(result.endState)).to.equal(`[=][=][=][=][=][=][=][=][=][=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [+]         [=]
[=][=][=][=][=][=][=][=][=][=]
`)
    })

  it('should end game after max rounds', () => {
    const state: State = createState(10, 15, 3)
    const ai: Ai = makeDirectionAi(Direction.Down)

    const result: RunResult = run(state, ai, 3)

    expect(result.round).to.equal(3)
    expect(isGameOver(result.endState)).to.equal(false)
    expect(stateToString(result.endState)).to.equal(`[=][=][=][=][=][=][=][=][=][=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]                        [=]
[=]            [-]         [=]
[=]            [-]         [=]
[=]            [+]         [=]
[=]                        [=]
[=]                        [=]
[=][=][=][=][=][=][=][=][=][=]
`)
  })
})

