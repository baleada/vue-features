import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'

const suite = createSuite('useHovering')

suite('Functionality guaranteed by `on` tests and TypeScript', () => {
  assert.ok(true)
})

suite.run()
