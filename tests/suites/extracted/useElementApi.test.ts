import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useElementApi')
)

suite(`builds single element API`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/single')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => (window as unknown as WithGlobals).testState.element.value)
  expected.from = null

  assert.is(from, expected.from)
  
  const to = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.ref((window as unknown as WithGlobals).testState.stub.value)
    await (window as unknown as WithGlobals).nextTick()
    return (window as unknown as WithGlobals).testState.element.value.tagName
  })
  expected.to = 'SPAN'

  assert.is(to, expected.to)
})

suite(`builds multiple elements API`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => [...(window as unknown as WithGlobals).testState.elements.value])
  expected.from = []

  assert.equal(from, expected.from)
  
  
  const to = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.getRef(0)((window as unknown as WithGlobals).testState.stub0.value);
    (window as unknown as WithGlobals).testState.getRef(1)((window as unknown as WithGlobals).testState.stub1.value);
    (window as unknown as WithGlobals).testState.getRef(2)((window as unknown as WithGlobals).testState.stub2.value);
    await (window as unknown as WithGlobals).nextTick()
    return (window as unknown as WithGlobals).testState.elements.value.map(element => element.className)
  })
  expected.to = ['0', '1', '2']

  assert.equal(to, expected.to)
})

suite(`identifies single element`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/singleIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => (window as unknown as WithGlobals).testState.id.value.length),
        expected = 8

  assert.is(value, expected)
})

suite(`identifies multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multipleIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => (window as unknown as WithGlobals).testState.ids.value.every(id => id.length === 8)),
        expected = true

  assert.is(value, expected)
})



suite.run()
