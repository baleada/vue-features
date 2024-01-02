import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useButton')
)

suite('aria roles are correctly assigned', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButton/withoutOptions')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => document.querySelector('button').getAttribute('role'))
  assert.is(value, 'button')
})

suite('aria-pressed is not assigned for normal buttons', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButton/withoutOptions')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => document.querySelector('button').getAttribute('aria-pressed'))
  assert.is(value, null)
})

suite('aria-pressed is assigned for toggle buttons', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButton/toggle')
  await page.waitForSelector('button', { state: 'attached' })

  const from = await page.evaluate(() => document.querySelector('button').getAttribute('aria-pressed'))
  assert.is(from, 'false')
  
  await page.focus('button')
  await page.keyboard.press('Enter')
  const to = await page.evaluate(() => document.querySelector('button').getAttribute('aria-pressed'))
  assert.is(to, 'true')
})

suite('status updates reactively for toggle buttons', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButton/toggle')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.press('Enter')
  const from = await page.evaluate(() => window.testState.button.status.value)
  assert.is(from, 'on')
  
  await page.keyboard.press('Enter')
  const to = await page.evaluate(() => window.testState.button.status.value)
  assert.is(to, 'off')
})

suite('respects initial status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButton/withInitialStatus')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.button.status.value)
  assert.is(value, 'on')
})

suite('toggle() toggles status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButton/toggle')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.button.toggle()

          await window.nextTick()

          return window.testState.button.status.value
        }),
        expected = 'on'
  
  assert.is(value, expected)
})

suite('on() sets status to on', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButton/toggle')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.button.on()

          await window.nextTick()

          return window.testState.button.status.value
        }),
        expected = 'on'
  
  assert.is(value, expected)
})

suite('off() sets status to off', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButton/toggle')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.button.on()
          await window.nextTick()
          
          window.testState.button.off()
          await window.nextTick()

          return window.testState.button.status.value
        }),
        expected = 'off'
  
  assert.is(value, expected)
})

suite.run()
