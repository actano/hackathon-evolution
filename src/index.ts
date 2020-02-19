import { createState, stateToString } from './game'

const initialState = createState(10, 10, 5)
console.log(stateToString(initialState))
