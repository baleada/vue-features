import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'

const suite = createSuite('usePressing')

suite.skip('is tested', async ({ playwright: { page } }) => {
  assert.ok(false)
})

suite.run()
