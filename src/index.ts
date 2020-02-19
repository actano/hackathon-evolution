import { createState, createState2, stateToString } from './game/model'
import {
  createTournamentParentSelection,
  fittestSelection, MAX_ROUNDS,
  simulatePopulation,
} from './ai/population'
import { roundEvaluation, runPrint, scoreRoundEvalution } from './game/execution'
import { createEvolver } from './ai/evolve'

const initialState = createState2(10, 10, 5)

const result = simulatePopulation(
  Math.random,
  initialState,
  100,
  100,
  scoreRoundEvalution,
  createTournamentParentSelection(4),
  createEvolver(Math.random),
  0.15,
)


const best = fittestSelection(result, 1)[0]

runPrint(initialState, best.ai, MAX_ROUNDS)

console.log(JSON.stringify(best, null, 2))
