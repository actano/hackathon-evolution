import range from 'lodash/fp/range'
import sortBy from 'lodash/fp/sortBy'

import { AstAi } from './ast'
import { State } from '../game/model'
import { createRandomAstAi, Evolver, RandomNumberGenerator } from './evolve'
import { EvaluationFunction, Quality, run } from '../game/execution'

export type Population = AstAi[]

type EvaluatedIndividual = {
  ai: AstAi,
  quality: Quality,
}

type EvaluatedPopulation = EvaluatedIndividual[]

type SelectionFunction = (evaluatedPopulation: EvaluatedPopulation, count: number) => EvaluatedPopulation

const MAX_ROUNDS = 100

function evaluateIndividual(evaluationFunction: EvaluationFunction, ai : AstAi, initialState: State): Quality {
  const runResult = run(initialState, ai, MAX_ROUNDS)
  return evaluationFunction(runResult)
}

function evaluatePopulation(
  population: Population,
  evaluationFunction: EvaluationFunction,
  initialState: State,
): EvaluatedPopulation {
  return population.map(
    individual => ({
      ai: individual,
      quality: evaluateIndividual(evaluationFunction, individual, initialState),
    })
  )
}

export const fittestSelection: SelectionFunction = (evaluatedPopulation, count) => {
  const sorted = sortBy(
    (i: EvaluatedIndividual) => -i.quality,
    evaluatedPopulation,
  )
  return sorted.slice(count)
}

export function simulatePopulation(
  rand: RandomNumberGenerator,
  initialState: State,
  maxGenerations: number,
  populationSize: number,
  evaluationFunction: EvaluationFunction,
  selectionFunction: SelectionFunction,
  evolver: Evolver,
  mutationRate: number,
): EvaluatedPopulation {
  const initialPopulation: Population = range(0, populationSize).map(() => createRandomAstAi(rand))

  let currentPopulation  = evaluatePopulation(
    initialPopulation,
    evaluationFunction,
    initialState,
  )
  let currentGeneration = 0

  while (currentGeneration < maxGenerations) {
    const [a, b] = selectionFunction(currentPopulation, 2)

    const childPopulation : Population = range(0, populationSize).map(
      () => {
        const child = evolver.recombine(a.ai, b.ai)
        if (rand() < mutationRate) {
          return evolver.mutate(child)
        }
        return child
      },
    )

    const evaluatedChildPopulation = evaluatePopulation(
      childPopulation,
      evaluationFunction,
      initialState,
    )

    console.log('fittest child', selectionFunction(evaluatedChildPopulation, 1)[0].quality)

    const combinedPopulation : EvaluatedPopulation = [
      ...currentPopulation,
      ...evaluatedChildPopulation,
    ]

    currentPopulation = selectionFunction(combinedPopulation, populationSize)
    currentGeneration += 1

    console.log('fittest after round', selectionFunction(currentPopulation, 1)[0].quality)
  }

  return currentPopulation
}
