import range from 'lodash/fp/range'

import { Direction, isGameOver, move, State, stateToString } from './model'

interface Ai {
  step(state: State): Direction,
}

const makeDirectionAi: (d: Direction) => Ai = (d) => {
  return {
    step(state: State): Direction {
      return d
    }
  }
}

interface RunResult {
  round: number,
  endState: State,
}

function run(initialState: State, ai: Ai, maxRounds: number): RunResult {
  let currentState: State = initialState

  for (const round of range(0, maxRounds)) {
    const direction = ai.step(currentState)
    currentState = move(currentState, direction)

    if (isGameOver(currentState)) {
      return {
        round: round,
        endState: currentState,
      }
    }
  }

  return {
    round: maxRounds,
    endState: currentState
  }
}

export function runPrint(initialState: State, ai: Ai, maxRounds: number): RunResult {
  let currentState: State = initialState

  for (const round of range(0, maxRounds)) {
    const direction = ai.step(currentState)
    currentState = move(currentState, direction)

    console.log(stateToString(currentState))

    if (isGameOver(currentState)) {
      return {
        round: round,
        endState: currentState,
      }
    }
  }

  console.log(stateToString(currentState))

  return {
    round: maxRounds,
    endState: currentState
  }
}

type Quality = number
type EvaluationFunction = (result: RunResult) => Quality

const roundEvaluation: EvaluationFunction = (result: RunResult) => result.round
const scoreRoundEvalution: EvaluationFunction = (result: RunResult) => result.round * 100 + result.endState.score

export {
  Ai,
  RunResult,
  Quality,
  EvaluationFunction,
  run,
  makeDirectionAi,
  roundEvaluation,
  scoreRoundEvalution,
}
