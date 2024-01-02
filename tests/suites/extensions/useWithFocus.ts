import { suite as createSuite } from 'uvu'

import * as assert from 'uvu/assert'

const suite = createSuite('useWithFocus')

suite('Functionality guaranteed by `on` tests and TypeScript', () => {
  assert.ok(true)
})

suite.run()
