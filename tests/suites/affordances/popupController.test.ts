import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('popupController')
)

suite('binds has', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/popupController')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.element.value.getAttribute('aria-haspopup')
        }),
        expected = 'false'

  assert.is(value, expected)
})

suite('respects has option', async ({ playwright: { page } }) => {
  const options = {
    has: 'menu',
  }  
  await page.goto(`http://localhost:5173/popupController${toOptionsParam(options)}`)
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.element.value.getAttribute('aria-haspopup')
        }),
        expected = 'menu'

  assert.is(value, expected)
})

suite.run()
