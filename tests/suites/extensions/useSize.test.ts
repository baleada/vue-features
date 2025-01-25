import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useSize')
)

suite('reactively tracks border box', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useSize/withoutOptions')
  await page.waitForSelector('span', { state: 'attached' })

  const expected: any = {}

  const { height: heightFrom, width: widthFrom } = await page.viewportSize(),
        from = await page.evaluate(() => window.testState.size.borderBox.value.width)
  expected.from = widthFrom

  assert.is(from, expected.from)

  await page.setViewportSize({ height: heightFrom, width: widthFrom + 100 })
  await page.waitForTimeout(20)
  const { width: widthTo } = await page.viewportSize(),
        to = await page.evaluate(() => window.testState.size.borderBox.value.width)
  expected.to = widthTo

  assert.is(to, expected.to)
})

suite('reactively tracks breakpoints', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useSize/withoutOptions')
  await page.waitForSelector('span', { state: 'attached' })
  await page.setViewportSize({ height: 100, width: 2000 })

  const tailwindBreakpoints: [string, number][] = [
    ['sm', 640],
    ['md', 768],
    ['lg', 1024],
    ['xl', 1280],
    ['2xl', 1536],
  ]

  for (let i = 0; i < tailwindBreakpoints.length; i++) {
    const [name, width] = tailwindBreakpoints[i]

    await page.setViewportSize({ height: 100, width: width - 1 })
    await page.waitForTimeout(20)
    const from = await page.evaluate(async name => window.testState.size.breaks.value.width[name], name)
    assert.is(from, false)

    await page.setViewportSize({ height: 100, width })
    await page.waitForTimeout(20)
    const to = await page.evaluate(async name => window.testState.size.breaks.value.width[name], name)
    assert.is(to, true)
  }
})

suite('appropriately includes \'zero\' breakpoint', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useSize/withoutOptions')
  await page.waitForSelector('span', { state: 'attached' })

  await page.setViewportSize({ height: 100, width: 10 })
  const value = await page.evaluate(() => window.testState.size.breaks.value.width.zero)
  assert.is(value, true)
})

suite('respects custom breakpoints', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useSize/withOptions')
  await page.waitForSelector('span', { state: 'attached' })

  await page.setViewportSize({ height: 100, width: 419 })
  await page.waitForTimeout(20)
  const from = await page.evaluate(() => window.testState.size.breaks.value.width.stub)
  assert.is(from, false)

  await page.setViewportSize({ height: 100, width: 420 })
  await page.waitForTimeout(20)
  const to = await page.evaluate(() => window.testState.size.breaks.value.width.stub)
  assert.is(to, true)
})

suite('tracks orientation', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useSize/withoutOptions')
  await page.waitForSelector('span', { state: 'attached' })

  await (async () => {
    await page.setViewportSize({ height: 100, width: 101 })
    await page.waitForTimeout(20)
    const value = await page.evaluate(() => window.testState.size.orientation.value),
          expected = 'landscape'

    assert.is(value, expected)
  })()

  await (async () => {
    await page.setViewportSize({ height: 101, width: 100 })
    await page.waitForTimeout(20)
    const value = await page.evaluate(() => window.testState.size.orientation.value),
          expected = 'portrait'

    assert.is(value, expected)
  })()
})

suite.run()
