import { createState, stateToString } from './game/model'
import {
  createTournamentParentSelection,
  fittestSelection,
  simulatePopulation,
} from './ai/population'
import { roundEvaluation } from './game/execution'
import { createEvolver } from './ai/evolve'

const initialState = createState(100, 100, 5)

const result = simulatePopulation(
  Math.random,
  initialState,
  1000,
  1000,
  roundEvaluation,
  createTournamentParentSelection(4),
  createEvolver(Math.random),
  0.15,
)

console.log(JSON.stringify(fittestSelection(result, 1)[0], null, 2))
