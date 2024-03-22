import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('model')
)

suite(`sets value on input by default`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/model/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.evaluate(() => document.querySelector('input').focus())
  await page.keyboard.press('B')
  const value = await page.evaluate(() => document.querySelector('input').value),
        expected = 'B'

  assert.is(value, expected)
})

suite(`sets value after third party changes`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/model/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.evaluate(() => document.querySelector('input').focus())
  const value = await page.evaluate(async () => {
          window.testState.modelValue.value = 'B'
          await window.nextTick()
          return document.querySelector('input').value
        }),
        expected = 'B'

  assert.is(value, expected)
})

suite(`sets custom attribute on custom event`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/model/withOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.evaluate(() => document.querySelector('input').focus())
  await page.keyboard.press('B')
  await page.keyboard.press('Tab')
  const value = await page.evaluate(() => document.querySelector('input').dataset.value),
        expected = 'B'

  assert.is(value, expected)
})

suite.run()
