import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useLink')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useLink/withoutOptions')
  await page.waitForSelector('a')

  const value = await page.evaluate(() => document.querySelector('a').getAttribute('role'))
  assert.is(value, 'link')
})

suite.run()
