import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { predicateRenderedWatchSourcesChanged } from '../../../src/extracted/predicateRenderedWatchSourcesChanged'

const suite = createSuite('predicateRenderedWatchSourcesChanged')

suite('detects change in non-rendered watch sources', () => {
  const value = predicateRenderedWatchSourcesChanged(
          [
            [[1, 2, 3]],
            0,
          ],
          [
            [[1, 2, 3]],
            1,
          ],
        ),
        expected = true

  assert.is(value, expected)
})

suite('compares non-rendered watch sources for deep equality', () => {
  const value = predicateRenderedWatchSourcesChanged(
          [
            [[1, 2, 3]],
            { a: 1 },
          ],
          [
            [[1, 2, 3]],
            { a: 1 },
          ],
        ),
        expected = false

  assert.is(value, expected)
})

suite('handles undefined previous', () => {
  const value = predicateRenderedWatchSourcesChanged(
          [
            [[1, 2, 3]],
            0,
          ],
          undefined,
        ),
        expected = true

  assert.is(value, expected)
})

// Rest is covered by `toPlaneStatus` and `toPlaneOrder` tests

suite.run()
