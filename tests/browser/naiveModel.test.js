import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('naiveModel (browser)')
)

suite(`sets value on input by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/naiveModel/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => document.querySelector('input').focus())
  await page.keyboard.press('B')
  const value = await page.evaluate(() => document.querySelector('input').getAttribute('value')),
        expected = 'B'

  assert.is(value, expected)
})

suite(`sets value after third party changes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/naiveModel/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => document.querySelector('input').focus())
  const value = await page.evaluate(async () => {
          window.TEST.value.value = 'B'
          await window.nextTick()
          return document.querySelector('input').getAttribute('value')
        }),
        expected = 'B'

  assert.is(value, expected)
})

suite(`sets custom attribute on custom event`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/naiveModel/withOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => document.querySelector('input').focus())
  await page.keyboard.press('B')
  await page.keyboard.press('Tab')
  const value = await page.evaluate(() => document.querySelector('input').getAttribute('placeholder')),
        expected = 'B'

  assert.is(value, expected)
})

suite.run()
