import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toPlaneOrder } from '../../../src/extracted/toPlaneOrder'

const suite = createSuite('toPlaneOrder')

suite('detects change', () => {
  const value = toPlaneOrder(
          [[1, 2, 3]],
          [[1, 3, 2]],
        ),
        expected = 'changed'

  assert.is(value, expected)
})

suite('detects none', () => {
  const value = toPlaneOrder(
          [[1, 2, 3]],
          [[1, 2, 3]],
        ),
        expected = 'none'

  assert.is(value, expected)
})

suite('respects predicateEqual option', () => {
  const value = toPlaneOrder(
          [[{ id: 1 }, { id: 2 }, { id: 3 }]],
          [[{ id: 1 }, { id: 3 }, { id: 2 }]],
          { predicateEqual: (itemA, itemB) => itemA.id === itemB.id },
        ),
        expected = 'changed'

  assert.is(value, expected)
})

suite.run()
