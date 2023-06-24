import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useCombobox')
)

suite('is tested', async ({ playwright: { page } }) => {
  assert.ok(false)
})

suite.run()
