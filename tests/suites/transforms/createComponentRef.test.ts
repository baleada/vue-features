import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('createComponentRef')
)

suite('creates component ref', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createComponentRef')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => window.testState.el.value.tagName === 'DIV')

  assert.ok(value)
})

suite('respects refName option', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createComponentRef')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => window.testState.foo.value.tagName === 'SPAN')

  assert.ok(value)
})

suite.run()
