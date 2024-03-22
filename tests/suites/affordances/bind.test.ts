import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('bind')
)

suite('recognizes and handles different attributes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bind')
  await page.waitForSelector('span', { state: 'attached' })

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
