import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useLink')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useLink/withoutOptions')
  await page.waitForSelector('a')

  const value = await page.evaluate(() => document.querySelector('a').getAttribute('role'))
  assert.is(value, 'link')
})

suite(`links can receive keyboard focus`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useLink/withoutOptions')
  await page.waitForSelector('a')

  const value = await page.evaluate(() => document.querySelector('a').getAttribute('tabindex'))
  assert.is(value, '0')
})

suite.run()
