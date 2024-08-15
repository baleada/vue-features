import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toPlaneStatus } from '../../../src/extracted/toPlaneStatus'
import { Plane } from '../../../src/extracted/plane'


const suite = createSuite('toPlaneStatus')

suite('handles undefined previousPlane', () => {
  const value = toPlaneStatus(
          new Plane([1, 2, 3]),
          undefined,
        ),
        expected = {
          rowWidth: 'lengthened',
          columnHeight: 'lengthened',
          order: 'changed',
        }

  assert.equal(value, expected)
})

suite('handles empty currentPlane', () => {
  const value = toPlaneStatus(
          new Plane(),
          new Plane([1, 2, 3]),
        ),
        expected = {
          rowWidth: 'n/a',
          columnHeight: 'n/a',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects row lengthened', () => {
  const value = toPlaneStatus(
          new Plane([1, 2, 3]),
          new Plane([1, 2]),
        ),
        expected = {
          rowWidth: 'lengthened',
          columnHeight: 'none',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects row shortened', () => {
  const value = toPlaneStatus(
          new Plane([1, 2]),
          new Plane([1, 2, 3]),
        ),
        expected = {
          rowWidth: 'shortened',
          columnHeight: 'none',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects no row length change', () => {
  const value = toPlaneStatus(
          new Plane([1, 2]),
          new Plane([1, 2]),
        ),
        expected = {
          rowWidth: 'none',
          columnHeight: 'none',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects column lengthened', () => {
  const value = toPlaneStatus(
          new Plane([1], [2], [3]),
          new Plane([1], [2]),
        ),
        expected = {
          rowWidth: 'none',
          columnHeight: 'lengthened',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects column shortened', () => {
  const value = toPlaneStatus(
          new Plane([1], [2]),
          new Plane([1], [2], [3]),
        ),
        expected = {
          rowWidth: 'none',
          columnHeight: 'shortened',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects no column length change', () => {
  const value = toPlaneStatus(
          new Plane([1], [2]),
          new Plane([1], [2]),
        ),
        expected = {
          rowWidth: 'none',
          columnHeight: 'none',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite.run()
