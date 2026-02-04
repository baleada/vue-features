import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import {
  withPlaywrightOptions,
} from '../../withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('useSeparatorStorage'),
  withPlaywrightOptions
)

suite('assigns position', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparatorStorage/variable')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.separator.exact(75)

    await window.nextTick()
  })

  await page.reload()
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return window.testState.separator.position.value
        }),
        expected = 75

  await page.evaluate(() => window.testState.cleanup())

  assert.is(value, expected)
})

suite.run()
