import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createToEffectedStatus'),
)

suite(`returns stale if a reactive reference other than the reactive array of elements triggers the effect`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/toEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.stub.value++
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.effectedStatus.value
        }),
        expected = 'stale'

  assert.is(value, expected)
})

suite(`returns stale if the length of the reactive array of elements has changed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/toEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elements.value = [
            (window as unknown as WithGlobals).testState.element1.value,
          ],
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.effectedStatus.value
        }),
        expected = 'stale'

  assert.is(value, expected)
})

suite(`returns stale if the order of the reactive array of elements has changed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/toEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elements.value = (window as unknown as WithGlobals).testState.elements.value.slice().reverse()
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.effectedStatus.value
        }),
        expected = 'stale'

  assert.is(value, expected)
})

suite(`returns fresh if the reactive array of elements i refilled with the same elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/toEffectedStatus')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elements.value = [
            (window as unknown as WithGlobals).testState.element1.value,
            (window as unknown as WithGlobals).testState.element2.value,
          ]
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.effectedStatus.value
        }),
        expected = 'fresh'

  assert.is(value, expected)
})

suite.run()
