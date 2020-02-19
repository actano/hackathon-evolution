import assert from 'assert'
import range from 'lodash/fp/range'

enum FieldContent {
  Nothing = 'Nothing',
  Wall = 'Wall',
  SnakeTail = 'SnakeTail',
  SnakeHead = 'SnakeHead',
}

interface Point {
  x: number,
  y: number,
}

interface State {
  board: FieldContent[][],
  snake: Point[],
  sizeX: number,
  sizeY: number,
}

function createState(sizeX: number, sizeY: number, snakeLength: number): State {
  const snakeHead = { x: Math.round(sizeX/2), y: Math.round(sizeY/2) }

  const state: State = {
    sizeX,
    sizeY,
    snake: range(0, snakeLength).map(dY => ({ x: snakeHead.x, y: snakeHead.y - dY })),
    board: range(0, sizeY).map(y =>
      range(0, sizeX).map(x => {
        if ((x === 0) || (x===sizeX-1) || (y===0) || (y===sizeY-1)) {
          return FieldContent.Wall
        }

        return FieldContent.Nothing
      })
    )
  }

  return state
}

function fieldToString(content: FieldContent): string {
  switch (content) {
    case FieldContent.Nothing:
      return '   '
    case FieldContent.Wall:
      return '[=]'
    case FieldContent.SnakeTail:
      return '[-]'
    case FieldContent.SnakeHead:
      return '[+]'
    default:
      throw new Error(`No symbol for field content ${content}`)
  }
}

function stateToString(state: State): string {
  let result = ''

  for (const y of range(0, state.sizeY)) {
    for (const x of range(0, state.sizeX)) {
      const content = getField(state, x, y)
      result += fieldToString(content)
    }
    result += '\n'
  }

  return result
}

enum Direction {
  Up,
  Right,
  Down,
  Left
}

interface Ai {
  step(state: State): Direction,
}

function pointEquals(p1: Point, p2: Point): boolean {
  return (p1.x === p2.x) && (p1.y === p2.y)
}

function getField(state: State, x: number, y: number): FieldContent {
  assert(y >= 0)
  assert(y < state.sizeY)
  assert(x >= 0)
  assert(x < state.sizeX)

  if (pointEquals(state.snake[0], { x, y })) {
    return FieldContent.SnakeHead
  }

  for (const tailPoint of state.snake.slice(1)) {
    if (pointEquals(tailPoint, { x, y })) {
      return FieldContent.SnakeTail
    }
  }

  const row = state.board[y]
  assert(row != null)

  const field = row[x]
  assert(field != null)

  assert(state.snake.length >= 1)

  return field
}

export {
  State,
  FieldContent,
  stateToString,
  fieldToString,
  createState,
  getField,
}

