import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useElementApi')
)

suite('builds element API', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/element')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.api.element.value.tagName
        }),
        expected = 'SPAN'

  assert.is(value, expected)
})

suite('builds list API', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/list')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.api.list.value.map(element => element.className)
        }),
        expected = ['0', '1', '2']

  assert.equal(value, expected)
})

suite('builds plane API', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/plane')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.api.plane.value.reduce((coords, row) => {
            for (const cell of row) {
              coords.push(cell.className)
            }

            return coords
          }, [])
        }),
        expected = ['0,0', '0,1', '0,2', '1,0', '1,1', '1,2']

  assert.equal(value, expected)
})

suite('identifies element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/elementIdentified')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => !!window.testState.api.id.value.length),
        expected = true

  assert.is(value, expected)
})

suite('identifies list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/listIdentified')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.api.ids.value.every(id => !!id.length)),
        expected = true

  assert.is(value, expected)
})

suite('identifies plane', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/planeIdentified')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.api.ids.value.every(row => row.every(id => !!id.length))),
        expected = true

  assert.is(value, expected)
})

suite('recognizes lengthening of list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/list')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.nums.value.push(3)
          await window.nextTick()
          return {
            order: window.testState.api.status.value.order,
            length: window.testState.api.status.value.length,
          }
        }),
        expected = { order: 'none', length: 'lengthened' }

  assert.equal(value, expected)
})

suite('recognizes shortening of list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/list')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.nums.value.pop()
          await window.nextTick()
          return {
            order: window.testState.api.status.value.order,
            length: window.testState.api.status.value.length,
          }
        }),
        expected = { order: 'none', length: 'shortened' }

  assert.equal(value, expected)
})

suite('recognizes reordering of list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/list')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.nums.value.sort((a, b) => b - a)
          await window.nextTick()
          return {
            order: window.testState.api.status.value.order,
            length: window.testState.api.status.value.length,
          }
        }),
        expected = { order: 'changed', length: 'none' }

  assert.equal(value, expected)
})

suite('recognizes lengthening of plane row', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/plane')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.columns.value.push(3)
          await window.nextTick()
          return {
            order: window.testState.api.status.value.order,
            rowWidth: window.testState.api.status.value.rowWidth,
            columnHeight: window.testState.api.status.value.columnHeight,
          }
        }),
        expected = { order: 'none', rowWidth: 'lengthened', columnHeight: 'none' }

  assert.equal(value, expected)
})

suite('recognizes shortening of plane row', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/plane')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.columns.value.pop()
          await window.nextTick()
          return {
            order: window.testState.api.status.value.order,
            rowWidth: window.testState.api.status.value.rowWidth,
            columnHeight: window.testState.api.status.value.columnHeight,
          }
        }),
        expected = { order: 'none', rowWidth: 'shortened', columnHeight: 'none' }

  assert.equal(value, expected)
})

suite('recognizes lengthening of plane column', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/plane')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.rows.value.push(2)
          await window.nextTick()
          return {
            order: window.testState.api.status.value.order,
            rowWidth: window.testState.api.status.value.rowWidth,
            columnHeight: window.testState.api.status.value.columnHeight,
          }
        }),
        expected = { order: 'none', rowWidth: 'none', columnHeight: 'lengthened' }

  assert.equal(value, expected)
})

suite('recognizes shortening of plane column', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/plane')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.rows.value = window.testState.rows.value.slice(0, 1)
          await window.nextTick()
          return {
            order: window.testState.api.status.value.order,
            rowWidth: window.testState.api.status.value.rowWidth,
            columnHeight: window.testState.api.status.value.columnHeight,
          }
        }),
        expected = { order: 'none', rowWidth: 'none', columnHeight: 'shortened' }

  assert.equal(value, expected)
})

suite('recognizes reordering of plane', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useElementApi/plane')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.columns.value = window.testState.columns.value.slice().sort((a, b) => b - a)
          await window.nextTick()
          return {
            order: window.testState.api.status.value.order,
            rowWidth: window.testState.api.status.value.rowWidth,
            columnHeight: window.testState.api.status.value.columnHeight,
          }
        }),
        expected = { order: 'changed', rowWidth: 'none', columnHeight: 'none' }

  assert.equal(value, expected)
})


suite.run()
