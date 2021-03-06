import assert from 'assert'
import range from 'lodash/fp/range'
import take from 'lodash/fp/take'

enum FieldContent {
  Nothing = 'Nothing',
  Wall = 'Wall',
  SnakeTail = 'SnakeTail',
  SnakeHead = 'SnakeHead',
  Food = 'Food',
}

interface Point {
  x: number,
  y: number,
}

interface State {
  board: FieldContent[][],
  score: number,
  snake: Point[],
  sizeX: number,
  sizeY: number,
  gameOver: boolean,
}

function createState(sizeX: number, sizeY: number, snakeLength: number): State {
  const snakeHead = { x: Math.round(sizeX/2), y: Math.round(sizeY/2) }

  const state: State = {
    sizeX,
    sizeY,
    score: 0,
    gameOver: false,
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

function createState2(sizeX: number, sizeY: number, snakeLength: number): State {
  const empty = createState(sizeX, sizeY, snakeLength)

  empty.board[Math.floor(sizeY/2)][1] = FieldContent.Wall
  empty.board[Math.floor(sizeY/2)][sizeX-2] = FieldContent.Wall
  empty.board[1][Math.floor(sizeX/2)] = FieldContent.Wall
  empty.board[sizeY-2][Math.floor(sizeX/2)] = FieldContent.Wall

  empty.board[Math.floor(sizeY/3)][1] = FieldContent.Food
  empty.board[Math.floor(sizeY/3)][Math.floor(sizeX / 3)] = FieldContent.Food

  return empty
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
    case FieldContent.Food:
      return '[*]'
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
  TurnRight = 'TurnRight',
  TurnLeft = 'TurnLeft',
  Straight = 'Straight',
}


function pointEquals(p1: Point, p2: Point): boolean {
  return (p1.x === p2.x) && (p1.y === p2.y)
}

function getFieldP(state: State, p: Point): FieldContent {
  return getField(state, p.x, p.y)
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

function isGameOver(state: State): boolean {
  return state.gameOver
}

function getSnakeHead(state: State): Point {
  assert(state.snake.length > 0)
  return state.snake[0]
}

function move(state: State, direction: Direction): State {
  const head = getSnakeHead(state)

  assert(state.snake.length >= 2)
  const beforeHead = state.snake[1]
  const headDirection = {
    x: head.x - beforeHead.x,
    y: head.y - beforeHead.y,
  }

  let newSnakeHead: Point
  switch (direction) {
    case Direction.Straight: {
      newSnakeHead = { x: head.x + headDirection.x, y: head.y + headDirection.y }
      break
    }
    case Direction.TurnRight: {
      newSnakeHead = { x: head.x - headDirection.y, y: head.y + headDirection.x }
      break
    }
    case Direction.TurnLeft: {
      newSnakeHead = { x: head.x + headDirection.y, y: head.y - headDirection.x }
      break
    }
    default: {
      assert(false, `Invalid direction ${direction}`)
    }
  }

  const contentNewHead = getFieldP(state, newSnakeHead)

  if ((contentNewHead === FieldContent.Wall) || (contentNewHead === FieldContent.SnakeTail) || (contentNewHead === FieldContent.SnakeHead)) {
    return {
      ...state,
      gameOver: true,
    }
  }

  return {
     ...state,
     score: (contentNewHead === FieldContent.Food) ? state.score + 1 : state.score,
     snake: [newSnakeHead, ...take(state.snake.length-1, state.snake)]
  }
}

export {
  State,
  FieldContent,
  Direction,
  stateToString,
  fieldToString,
  createState,
  createState2,
  getField,
  getFieldP,
  isGameOver,
  move,
}

