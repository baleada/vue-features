import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useBody')
)

suite('stores document.body in element API', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useBody')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => window.testState.body.element.value === document.body)

  assert.ok(value)
})

suite.run()
