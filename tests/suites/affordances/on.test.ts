import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('on')
)

suite(`adds event listener to element on mount`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/on/element')
  await page.waitForSelector('section')

  await page.click('section')
  const thereIsNoInitialListener = await page.evaluate(() => {
          return window.testState.count.value === 0
        })

  assert.ok(thereIsNoInitialListener)

  await page.evaluate(async () => {
    window.testState.childIsMounted.value = true
    await window.nextTick()
  })
  await page.click('section')
  const thereIsAListenerAfterMount = await page.evaluate(async () => {
          return window.testState.count.value === 1
        })
  
  assert.ok(thereIsAListenerAfterMount)
})

suite(`removes event listener from element after component is unmounted`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/on/element')
  await page.waitForSelector('section')

  await page.evaluate(async () => {
    window.testState.childIsMounted.value = true
    await window.nextTick()
  })
  await page.click('section')
  const thereIsAListenerAfterMount = await page.evaluate(async () => {
          return window.testState.count.value === 1
        })
  
  assert.ok(thereIsAListenerAfterMount)

  await page.evaluate(async () => {
    window.testState.childIsMounted.value = false
    await window.nextTick()
  })
  await page.click('section')
  const thereIsNoListenerAfterUnMount = await page.evaluate(async () => {
          return window.testState.count.value === 1
        })

  assert.ok(thereIsNoListenerAfterUnMount)
})

suite(`can remove listener from element via off()`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/on/off')
  await page.waitForSelector('section')

  await page.click('section')
  const from = await page.evaluate(() => {
          return window.testState.count.value
        })

  assert.is(from, 1)

  await page.click('section')
  const to = await page.evaluate(async () => {
          return window.testState.count.value
        })
  
  assert.is(to, 1)
})

suite(`adds event listeners to list`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/on/list')
  await page.waitForSelector('section')

  await page.evaluate(async () => {
    window.testState.childIsMounted.value = true
    await window.nextTick()
  })

  for (let index = 0; index < 3; index++) {
    await page.click(`section:nth-child(${index + 1})`)
    const value = await page.evaluate(async () => window.testState.index.value)
    assert.equal(value, index)
  }
})

suite(`adds event listeners to plane`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/on/plane')
  await page.waitForSelector('section')

  await page.evaluate(async () => {
    window.testState.childIsMounted.value = true
    await window.nextTick()
  })

  for (let row = 0; row < 2; row++) {
    for (let column = 0; column < 3; column++) {
      await page.click(`section:nth-child(${row * 3 + column + 1})`)
      const value = await page.evaluate(async () => ({
        row: window.testState.row.value,
        column: window.testState.column.value
      }))
      assert.equal(value, { row, column })
    }
  }
})

suite.run()
