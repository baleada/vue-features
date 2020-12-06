import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useBindings (browser)')
)

suite(`recognizes and handles different bindings`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useBindings')

  await page.waitForSelector('span')
  const value = await page.evaluate(async () => {
          const stub = document.querySelector('span')

          return {
            id: stub.id,
            classList: [...stub.classList],
            style_backgroundColor: stub.style.backgroundColor,
          }
        }),
        expected = {
          id: 'stub',
          classList: ['stub'],
          style_backgroundColor: 'red',
        }

  assert.equal(value, expected)
})

suite.run()
