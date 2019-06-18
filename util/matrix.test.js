import assert from 'assert'
import { slice, resolve_slice, matrix_slice, matrix_flatten, matrix_transpose } from './matrix'

describe('util.matrix', () => {
  it('resolve_slice', () => {
    assert.deepEqual(
        resolve_slice(5, 10),
        {
          left: 5,
          right: 6,
        }
    )
    assert.deepEqual(
        resolve_slice(slice(5, -1), 10),
        {
          left: 5,
          right: 9,
        }
    )
    assert.deepEqual(
        resolve_slice(slice(null, -2), 10),
        {
          left: 0,
          right: 8,
        }
    )
    assert.deepEqual(
        resolve_slice(slice(3, null), 10),
        {
          left: 3,
          right: 10,
        }
    )
  })

  it('matrix_slice', () => {
    assert.deepEqual(
        matrix_slice([
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
        slice(1, null),
        slice(null, -1)
        ),
        [
          [2, 3],
          [5, 6],
        ]
    )
  })

  it('matrix_flatten', () => {
    assert.deepEqual(
        matrix_flatten([
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ]),
        [
          1, 2, 3, 4, 5, 6, 7, 8, 9,
        ]
    )
  })

  it('matrix_transpose', () => {
    assert.deepEqual(
        matrix_transpose([
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ]),
        [
          [1, 4, 7],
          [2, 5, 8],
          [3, 6, 9],
        ]
    )
  })
})
