import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useButton')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useButton/withoutOptions')
  await page.waitForSelector('button')

  const value = await page.evaluate(() => document.querySelector('button').getAttribute('role'))
  assert.is(value, 'button')
})

suite(`aria-pressed is not assigned for normal buttons`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useButton/withoutOptions')
  await page.waitForSelector('button')

  const value = await page.evaluate(() => document.querySelector('button').getAttribute('aria-pressed'))
  assert.is(value, null)
})

suite(`aria-pressed is assigned for toggle buttons`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useButton/toggle')
  await page.waitForSelector('button')

  const from = await page.evaluate(() => document.querySelector('button').getAttribute('aria-pressed'))
  assert.is(from, 'false')
  
  await page.focus('button')
  await page.keyboard.press('Enter')
  const to = await page.evaluate(() => document.querySelector('button').getAttribute('aria-pressed'))
  assert.is(to, 'true')
})

suite(`clicked state updates reactively for normal buttons`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useButton/withoutOptions')
  await page.waitForSelector('button')

  await page.focus('button')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.button.clicked.value)
  assert.is(value, 3)
})

suite(`status updates reactively for toggle buttons`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useButton/toggle')
  await page.waitForSelector('button')

  await page.focus('button')
  await page.keyboard.press('Enter')
  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.button.status.value)
  assert.is(from, 'on')
  
  await page.keyboard.press('Enter')
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.button.status.value)
  assert.is(to, 'off')
})

suite(`respects initial status`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useButton/withInitialStatus')
  await page.waitForSelector('button')

  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.button.status.value)
  assert.is(value, 'on')
})


suite.run()
