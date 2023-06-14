import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('createToEffectedStatus'),
)

suite(`returns stale if a reactive reference other than the reactive plane triggers the effect`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          window.testState.stub.value++
          await window.nextTick()
          return window.testState.effectedStatus.value
        }),
        expected = 'stale'

  assert.is(value, expected)
})

suite(`returns stale if the row length of the reactive plane has changed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          window.testState.shouldAddRow.value = true,
          await window.nextTick()
          return window.testState.effectedStatus.value
        }),
        expected = 'stale'

  assert.is(value, expected)
})

suite(`returns stale if the column length of the reactive plane has changed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          window.testState.shouldAddColumn.value = true,
          await window.nextTick()
          return window.testState.effectedStatus.value
        }),
        expected = 'stale'

  assert.is(value, expected)
})

suite(`returns stale if the order of the reactive plane has changed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          window.testState.shouldReorderRows.value = true
          await window.nextTick()
          return window.testState.effectedStatus.value
        }),
        expected = 'stale'

  assert.is(value, expected)
})

suite(`returns fresh if the reactive array of elements is refilled with the same elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          window.testState.api.elements.value = [
            [...window.testState.api.elements.value[0]],
            [...window.testState.api.elements.value[1]],
          ]
          await window.nextTick()
          return window.testState.effectedStatus.value
        }),
        expected = 'fresh'

  assert.is(value, expected)
})

suite.run()
