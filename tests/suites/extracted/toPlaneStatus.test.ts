import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toPlaneStatus } from '../../../src/extracted/toPlaneStatus'

const suite = createSuite('toPlaneStatus')

suite('handles undefined previousPlane', () => {
  const value = toPlaneStatus(
          [[1, 2, 3]],
          undefined,
        ),
        expected = {
          rowLength: 'lengthened',
          columnLength: 'lengthened',
          order: 'changed',
        }

  assert.equal(value, expected)
})

suite('handles empty currentPlane', () => {
  const value = toPlaneStatus(
          [],
          [[1, 2, 3]],
        ),
        expected = {
          rowLength: 'n/a',
          columnLength: 'n/a',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects row lengthened', () => {
  const value = toPlaneStatus(
          [[1, 2, 3]],
          [[1, 2]],
        ),
        expected = {
          rowLength: 'lengthened',
          columnLength: 'none',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects row shortened', () => {
  const value = toPlaneStatus(
          [[1, 2]],
          [[1, 2, 3]],
        ),
        expected = {
          rowLength: 'shortened',
          columnLength: 'none',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects no row length change', () => {
  const value = toPlaneStatus(
          [[1, 2]],
          [[1, 2]],
        ),
        expected = {
          rowLength: 'none',
          columnLength: 'none',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects column lengthened', () => {
  const value = toPlaneStatus(
          [[1], [2], [3]],
          [[1], [2]],
        ),
        expected = {
          rowLength: 'none',
          columnLength: 'lengthened',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects column shortened', () => {
  const value = toPlaneStatus(
          [[1], [2]],
          [[1], [2], [3]],
        ),
        expected = {
          rowLength: 'none',
          columnLength: 'shortened',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite('detects no column length change', () => {
  const value = toPlaneStatus(
          [[1], [2]],
          [[1], [2]],
        ),
        expected = {
          rowLength: 'none',
          columnLength: 'none',
          order: 'none',
        }

  assert.equal(value, expected)
})

suite.run()
