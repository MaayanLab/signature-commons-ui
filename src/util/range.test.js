import assert from 'assert'
import { range } from './range'

describe('util.range', () => {
  it('works with 1 arg', () => {
    assert.deepEqual(
      range(2),
      [
        0, 1
      ]
    )
  })
  it('works with 2 args', () => {
    assert.deepEqual(
      range(2, 6),
      [
        2, 3, 4, 5,
      ]
    )
  })
})
