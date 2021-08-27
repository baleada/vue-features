import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('useContentRect')
)

suite(`reactively tracks pixels`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useContentRect/withoutOptions')
  await page.waitForSelector('span')

  const expected: any = {}

  const { height: heightFrom, width: widthFrom } = await page.viewport(),
        from = await page.evaluate(() => (window as unknown as WithGlobals).testState.pixels.value.width)
  expected.from = widthFrom

  assert.is(from, expected.from)
  
  await page.setViewport({ height: heightFrom, width: widthFrom + 100 })
  await page.waitForTimeout(20)
  const { width: widthTo } = await page.viewport(),
        to = await page.evaluate(() => (window as unknown as WithGlobals).testState.pixels.value.width)
  expected.to = widthTo

  assert.is(to, expected.to)
})

suite(`reactively tracks breakpoints`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useContentRect/withoutOptions')
  await page.waitForSelector('span')
  await page.setViewport({ height: 100, width: 2000 })

  const tailwindBreakpoints: [string, number][] = [
    ['sm', 640],
    ['md', 768],
    ['lg', 1024],
    ['xl', 1280],
    ['2xl', 1536],
  ]

  for (let i = 0; i < tailwindBreakpoints.length; i++) {
    const [name, width] = tailwindBreakpoints[i]

    await page.setViewport({ height: 100, width: width - 1 })
    await page.waitForTimeout(20)
    const from = await page.evaluate(async name => (window as unknown as WithGlobals).testState.breaks[name].value, name)
    assert.is(from, false)
    
    await page.setViewport({ height: 100, width })
    await page.waitForTimeout(20)
    const to = await page.evaluate(async name => (window as unknown as WithGlobals).testState.breaks[name].value, name)
    assert.is(to, true)
  }
})

suite(`appropriately includes 'none' breakpoint`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useContentRect/withoutOptions')
  await page.waitForSelector('span')
  
  await page.setViewport({ height: 100, width: 0 })
  const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.breaks.none.value)
  assert.is(value, true)
})

suite(`respects custom breakpoints`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useContentRect/withOptions')
  await page.waitForSelector('span')

  await page.setViewport({ height: 100, width: 419 })
  await page.waitForTimeout(20)
  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.breaks.stub.value)
  assert.is(from, false)
  
  await page.setViewport({ height: 100, width: 420 })
  await page.waitForTimeout(20)
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.breaks.stub.value)
  assert.is(to, true)
})

suite(`tracks orientation`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useContentRect/withoutOptions')
  await page.waitForSelector('span')

  await (async () => {
    await page.setViewport({ height: 100, width: 101 })
    await page.waitForTimeout(20)
    const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.orientation.value),
          expected = 'landscape'

    assert.is(value, expected)
  })()

  await (async () => {
    await page.setViewport({ height: 101, width: 100 })
    await page.waitForTimeout(20)
    const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.orientation.value),
          expected = 'portrait'

    assert.is(value, expected)
  })()
})

suite.run()
