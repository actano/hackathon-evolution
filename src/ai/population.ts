import range from 'lodash/fp/range'
import sortBy from 'lodash/fp/sortBy'

import { AstAi } from './ast'
import { State } from '../game/model'
import { createRandomAstAi, Evolver, getRandomElement, RandomNumberGenerator } from './evolve'
import { EvaluationFunction, Quality, run } from '../game/execution'

export type Population = AstAi[]

type EvaluatedIndividual = {
  ai: AstAi,
  quality: Quality,
}

type EvaluatedPopulation = EvaluatedIndividual[]

type ParentSelectionFunction = (evaluatedPopulation: EvaluatedPopulation, rand: RandomNumberGenerator, count: number) => EvaluatedPopulation

export const MAX_ROUNDS = 100

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

export const fittestSelection = (evaluatedPopulation: EvaluatedPopulation, count: number) => {
  const sorted = sortBy(
    (i: EvaluatedIndividual) => -i.quality,
    evaluatedPopulation,
  )
  return sorted.slice(0, count)
}

export const fittestParentSelection: ParentSelectionFunction = (pop, rand, count) => {
  return fittestSelection(pop, count)
}

function getRandomNElements<T>(rand: RandomNumberGenerator, list: T[], n: number): T[] {
  return range(0, n).map(() => getRandomElement(rand, list))
}


export const createTournamentParentSelection: (tournamentSize: number) => ParentSelectionFunction = (tournamentSize) =>
  (pop, rand, count) => {
    return range(0, count).map(() => {
      const individuals = getRandomNElements(rand, pop, tournamentSize)
      return fittestSelection(individuals, 1)[0]
    })
  }

export function simulatePopulation(
  rand: RandomNumberGenerator,
  initialState: State,
  maxGenerations: number,
  populationSize: number,
  evaluationFunction: EvaluationFunction,
  selectionParentFunction: ParentSelectionFunction,
  evolver: Evolver,
  mutationRate: number,
): EvaluatedPopulation {
  const initialPopulation: Population = range(0, populationSize).map(() => createRandomAstAi(rand))
  // const initialPopulation: Population = range(0, populationSize).map(() => createAstAi(astGetX()))

  let currentPopulation = evaluatePopulation(
    initialPopulation,
    evaluationFunction,
    initialState,
  )
  let currentGeneration = 0

  while (currentGeneration < maxGenerations) {
    const childPopulation : Population = range(0, populationSize).map(
      () => {
        const [a, b] = selectionParentFunction(currentPopulation, rand, 2)

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

    console.log('fittest child', fittestSelection(evaluatedChildPopulation, 1)[0].quality)

    const combinedPopulation : EvaluatedPopulation = [
      ...currentPopulation,
      ...evaluatedChildPopulation,
    ]

    currentPopulation = fittestSelection(combinedPopulation, populationSize)
    currentGeneration += 1

    const fittestIndividual = fittestSelection(currentPopulation,  1)[0]
    console.log('fittest after round', fittestIndividual.quality)
  }

  return currentPopulation
}
