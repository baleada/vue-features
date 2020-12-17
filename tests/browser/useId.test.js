import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useId (browser')
)

suite(`respects existing IDs`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useId/withId')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.querySelector('code').textContent
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`respects existing IDs`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useId/withoutId')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.querySelector('code').textContent
        })

  // Generated nanoid has the default 21 characters
  assert.ok(value.length === 21)
})

suite.run()
