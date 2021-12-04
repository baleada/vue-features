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

  const from = await page.evaluate(async () => (window as unknown as WithGlobals).testState.elementApi.element.value)
  expected.from = null

  assert.is(from, expected.from)
  
  const to = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.elementApi.ref((window as unknown as WithGlobals).testState.stub.value)
    await (window as unknown as WithGlobals).nextTick()
    return (window as unknown as WithGlobals).testState.elementApi.element.value.tagName
  })
  expected.to = 'SPAN'

  assert.is(to, expected.to)
})

suite(`builds multiple elements API`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => [...(window as unknown as WithGlobals).testState.elementsApi.elements.value])
  expected.from = []

  assert.equal(from, expected.from)
  
  
  const to = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.elementsApi.getRef(0)((window as unknown as WithGlobals).testState.stub0.value);
    (window as unknown as WithGlobals).testState.elementsApi.getRef(1)((window as unknown as WithGlobals).testState.stub1.value);
    (window as unknown as WithGlobals).testState.elementsApi.getRef(2)((window as unknown as WithGlobals).testState.stub2.value);
    await (window as unknown as WithGlobals).nextTick()
    return (window as unknown as WithGlobals).testState.elementsApi.elements.value.map(element => element.className)
  })
  expected.to = ['0', '1', '2']

  assert.equal(to, expected.to)
})

suite(`identifies single element`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/singleIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => (window as unknown as WithGlobals).testState.elementApi.id.value.length),
        expected = 8

  assert.is(value, expected)
})

suite(`identifies multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multipleIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => (window as unknown as WithGlobals).testState.elementsApi.ids.value.every(id => id.length === 8)),
        expected = true

  assert.is(value, expected)
})

suite(`recognizes lengthening of multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elementsApi.elements.value = [(window as unknown as WithGlobals).testState.stub0.value];
          await (window as unknown as WithGlobals).nextTick();
          (window as unknown as WithGlobals).testState.elementsApi.elements.value = [
            (window as unknown as WithGlobals).testState.stub0.value,
            (window as unknown as WithGlobals).testState.stub1.value,
          ];  
          return {
            order: (window as unknown as WithGlobals).testState.elementsApi.status.value.order,
            length: (window as unknown as WithGlobals).testState.elementsApi.status.value.length,
          }
        }),
        expected = { order: 'none', length: 'lengthened' }

  assert.equal(value, expected)
})

suite(`recognizes shortening of multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elementsApi.elements.value = [
            (window as unknown as WithGlobals).testState.stub0.value,
            (window as unknown as WithGlobals).testState.stub1.value,
          ];  
          await (window as unknown as WithGlobals).nextTick();
          (window as unknown as WithGlobals).testState.elementsApi.elements.value = (window as unknown as WithGlobals).testState.elementsApi.elements.value.slice(0, 1)
          await (window as unknown as WithGlobals).nextTick();
          return {
            order: (window as unknown as WithGlobals).testState.elementsApi.status.value.order,
            length: (window as unknown as WithGlobals).testState.elementsApi.status.value.length,
          }
        }),
        expected = { order: 'none', length: 'shortened' }

  assert.equal(value, expected)
})

suite(`recognizes reordering of multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elementsApi.getRef(0)((window as unknown as WithGlobals).testState.stub0.value);
          (window as unknown as WithGlobals).testState.elementsApi.getRef(1)((window as unknown as WithGlobals).testState.stub1.value);
          await (window as unknown as WithGlobals).nextTick();
          (window as unknown as WithGlobals).testState.elementsApi.elements.value = (window as unknown as WithGlobals).testState.elementsApi.elements.value.slice().reverse()
          await (window as unknown as WithGlobals).nextTick();
          return {
            order: (window as unknown as WithGlobals).testState.elementsApi.status.value.order,
            length: (window as unknown as WithGlobals).testState.elementsApi.status.value.length,
          }
        }),
        expected = { order: 'changed', length: 'none' }

  assert.equal(value, expected)
})



suite.run()
