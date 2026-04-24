import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import {
  withPlaywrightOptions,
} from '../../fixtures/withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('useBalanced'),
  withPlaywrightOptions
)

suite.skip('is tested', async ({ playwright: { page } }) => {
  assert.ok(false)
})

suite.run()
