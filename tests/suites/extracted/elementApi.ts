import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('elementApi')
)

suite(`returns single element with ref`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/elementApi/single')
  await page.waitForSelector('span')

  const expected: any = {}

  // @ts-ignore
  const from = await page.evaluate(async () => (window as unknown as WithGlobals).testState.element.value)
  expected.from = null

  assert.is(from, expected.from)
  
  const to = await page.evaluate(async () => {
    // @ts-ignore
    (window as unknown as WithGlobals).testState.ref((window as unknown as WithGlobals).testState.stub.value)
    // @ts-ignore
    await (window as unknown as WithGlobals).nextTick()
    // @ts-ignore
    return (window as unknown as WithGlobals).testState.element.value.tagName
  })
  expected.to = 'SPAN'

  assert.is(to, expected.to)
})

suite(`returns multiple elements with getRef`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/elementApi/multiple')
  await page.waitForSelector('span')

  const expected: any = {}

  // @ts-ignore
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

suite.run()
