import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useElementApi')
)

suite(`builds element API`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/element')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.api.element.value.tagName
        }),
        expected = 'SPAN'

  assert.is(value, expected)
})

suite(`builds list API`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/list')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.api.elements.value.map(element => element.className)
        }),
        expected = ['0', '1', '2']

  assert.equal(value, expected)
})

suite(`builds plane API`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/plane')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.api.elements.value.reduce((coords, row) => {
            for (const cell of row) {
              coords.push(cell.className)
            }
            
            return coords
          }, [])
        }),
        expected = ['0,0', '0,1', '0,2', '1,0', '1,1', '1,2']

  assert.equal(value, expected)
})

suite(`identifies element`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/elementIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => (window as unknown as WithGlobals).testState.api.id.value.length),
        expected = 8

  assert.is(value, expected)
})

suite(`identifies list`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/listIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => (window as unknown as WithGlobals).testState.api.ids.value.every(id => id.length === 8)),
        expected = true

  assert.is(value, expected)
})

suite(`identifies plane`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/planeIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => (window as unknown as WithGlobals).testState.api.ids.value.every(row => row.every(id => id.length === 8))),
        expected = true

  assert.is(value, expected)
})

suite.only(`recognizes lengthening of list`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/list')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.nums.value.push(3);
          await (window as unknown as WithGlobals).nextTick()
          return {
            order: (window as unknown as WithGlobals).testState.api.status.value.order,
            length: (window as unknown as WithGlobals).testState.api.status.value.length,
          }
        }),
        expected = { order: 'none', length: 'lengthened' }

  assert.equal(value, expected)
})

suite.only(`recognizes shortening of list`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/list')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.nums.value.pop();
          await (window as unknown as WithGlobals).nextTick()
          return {
            order: (window as unknown as WithGlobals).testState.api.status.value.order,
            length: (window as unknown as WithGlobals).testState.api.status.value.length,
          }
        }),
        expected = { order: 'none', length: 'shortened' }

  assert.equal(value, expected)
})

suite.only(`recognizes reordering of list`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/list')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.nums.value.sort((a, b) => b - a);
          await (window as unknown as WithGlobals).nextTick()
          return {
            order: (window as unknown as WithGlobals).testState.api.status.value.order,
            length: (window as unknown as WithGlobals).testState.api.status.value.length,
          }
        }),
        expected = { order: 'changed', length: 'none' }

  assert.equal(value, expected)
})


suite.run()
