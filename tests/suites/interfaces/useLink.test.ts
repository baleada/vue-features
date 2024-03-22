import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useLink')
)

suite(`correctly assigns aria roles`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useLink/withoutOptions')
  await page.waitForSelector('a', { state: 'attached' })

  const value = await page.evaluate(() => document.querySelector('a').getAttribute('role'))
  assert.is(value, 'link')
})

suite(`links can receive keyboard focus`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useLink/withoutOptions')
  await page.waitForSelector('a', { state: 'attached' })

  const value = await page.evaluate(() => document.querySelector('a').getAttribute('tabindex'))
  assert.is(value, '0')
})

suite.run()
