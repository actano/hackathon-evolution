import assert from 'assert'
import range from 'lodash/fp/range'
import take from 'lodash/fp/take'

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
  gameOver: boolean,
}

function createState(sizeX: number, sizeY: number, snakeLength: number): State {
  const snakeHead = { x: Math.round(sizeX/2), y: Math.round(sizeY/2) }

  const state: State = {
    sizeX,
    sizeY,
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
  Up = 'Up',
  Right = 'Right',
  Down = 'Down',
  Left = 'Left'
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

  let newSnakeHead: Point
  switch (direction) {
    case Direction.Down: {
      newSnakeHead = { x: head.x, y: head.y + 1 }
      break
    }
    case Direction.Up: {
      newSnakeHead = { x: head.x, y: head.y - 1 }
      break
    }
    case Direction.Right: {
      newSnakeHead = { x: head.x + 1, y: head.y }
      break
    }
    case Direction.Left: {
      newSnakeHead = { x: head.x - 1, y: head.y }
      break
    }
    default: {
      assert(false, `Invalid direction ${direction}`)
    }
  }

  const contentNewHead = getFieldP(state, newSnakeHead)

  if (contentNewHead != FieldContent.Nothing) {
    return {
      ...state,
      gameOver: true,
    }
  }

  return {
     ...state,
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
  getField,
  getFieldP,
  isGameOver,
  move,
}

