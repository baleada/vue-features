import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useGrid')
)

suite.skip('is tested', async ({ playwright: { page } }) => {
  assert.ok(false)
})

suite.run()
