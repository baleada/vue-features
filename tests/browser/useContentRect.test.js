import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useContentRect')
)

suite(`reactively tracks pixels`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useContentRect/withoutOptions')
  await page.waitForSelector('span')

  const expected = {}

  const { height: heightFrom, width: widthFrom } = await page.viewport(),
        from = await page.evaluate(() => (window as unknown as WithGlobals).testState.pixels.value.width)
  expected.from = widthFrom

  assert.is(from, expected.from)
  
  await page.setViewport({ height: heightFrom, width: widthFrom + 100 })
  const { width: widthTo } = await page.viewport(),
        to = await page.evaluate(() => (window as unknown as WithGlobals).testState.pixels.value.width)
  expected.to = widthTo

  assert.is(to, expected.to)
})

suite(`reactively tracks breakpoints`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useContentRect/withoutOptions')
  await page.waitForSelector('span')

  const expected = {}

  const { height: heightFrom, width: widthFrom } = await page.viewport(),
        from = await page.evaluate(() => (window as unknown as WithGlobals).testState.pixels.value.width)
  expected.from = widthFrom

  assert.is(from, expected.from)
  
  await page.setViewport({ height: heightFrom, width: widthFrom + 100 })
  const { width: widthTo } = await page.viewport(),
        to = await page.evaluate(() => (window as unknown as WithGlobals).testState.pixels.value.width)
  expected.to = widthTo

  assert.is(to, expected.to)
})

suite(`reactively tracks breakpoints`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useContentRect/withoutOptions')
  await page.waitForSelector('span')

  const TAILWIND_BREAKPOINTS = [
    ['sm', 640],
    ['md', 768],
    ['lg', 1024],
    ['xl', 1280],
    ['2xl', 1536],
  ]

  for (let i = 0; i < TAILWIND_BREAKPOINTS.length; i++) {
    const [name, width] = TAILWIND_BREAKPOINTS[i]

    await page.setViewport({ height: 100, width: width - 1 })
    const from = await page.evaluate(name => (window as unknown as WithGlobals).testState.breaks[name].value, name)
    assert.is(from, false)
    
    await page.setViewport({ height: 100, width: width })
    const to = await page.evaluate(name => (window as unknown as WithGlobals).testState.breaks[name].value, name)
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
  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.breaks.stub.value)
  assert.is(from, false)
  
  await page.setViewport({ height: 100, width: 420 })
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.breaks.stub.value)
  assert.is(to, true)
})

suite.run()
