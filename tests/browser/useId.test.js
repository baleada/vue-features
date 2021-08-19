import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { getCurrentInstance } from 'vue'

const suite = withPuppeteer(
  createSuite('useId (browser')
)

suite(`respects existing IDs`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useId/withId')
  await page.waitForSelector('span')

  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.id.value),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`generates IDs`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useId/withoutId')
  await page.waitForSelector('span')

  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.id.value)

  // Generated nanoid has the default 21 characters
  assert.ok(value.length === 21)
})

suite(`respects existing IDs for arrays`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useId/withIdsArray')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => [...(window as unknown as WithGlobals).testState.ids.value]),
        expected = ['0', '1', '2']

  assert.equal(value, expected)
})

suite(`generates IDs for arrays`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useId/withoutIdsArray')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => [...(window as unknown as WithGlobals).testState.ids.value])

  assert.ok(value.every(id => id.length === 21))
})

suite(`generates IDs for growing arrays`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useId/withoutIdsChangingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.add()
    await (window as unknown as WithGlobals).nextTick()
  })
  const value = await page.evaluate(async () => [...(window as unknown as WithGlobals).testState.ids.value])

  assert.ok(value.every(id => id.length === 21))
})

suite(`reuses generated IDs for reordered arrays`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useId/withoutIdsChangingArray')
  await page.waitForSelector('span')

  const from = await page.evaluate(async () => [...(window as unknown as WithGlobals).testState.ids.value])

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.reorder()
    await (window as unknown as WithGlobals).nextTick()
  })
  
  const to = await page.evaluate(async () => [...(window as unknown as WithGlobals).testState.ids.value])

  assert.is(from[0], to[0])
  assert.is(from[1], to[2])
  assert.is(from[2], to[1])
})

suite.run()
