import assert from 'assert'

export function assertNever(x: never) {
  assert(false, 'should not be called')
}

