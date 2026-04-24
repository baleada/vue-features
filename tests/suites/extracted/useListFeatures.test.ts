import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toParam'
import {
  withPlaywrightOptions,
} from '../../fixtures/withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('useListFeatures'),
  withPlaywrightOptions
)

suite('is tested', async ({ playwright: { page } }) => {
  assert.ok(false)
})

suite.run()
