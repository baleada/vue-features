import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('bind')
)

suite('recognizes and handles different attributes', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bind')

  await page.waitForSelector('span')
  const value = await page.evaluate(async () => {
          const stub = document.querySelector('span')

          return {
            id: stub.id,
            classList: [...stub.classList],
            style_backgroundColor: stub.style.backgroundColor,
            name: stub.hasAttribute('name'),
          }
        }),
        expected = {
          id: 'stub',
          classList: ['stub'],
          style_backgroundColor: 'red',
          name: false,
        }

  assert.equal(value, expected)
})

suite.run()
