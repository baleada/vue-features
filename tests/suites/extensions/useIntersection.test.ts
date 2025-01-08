import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useIntersection')
)

const mockIntersectionObserverEventLoopTiming = 20

suite('reactively tracks rect', async ({ playwright: { page, reloadNext } }) => {
  await page.goto('http:/localhost:5173/useIntersection/withoutOptions')
  await page.waitForSelector('span', { state: 'attached' })
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)

  const expected: any = {}

  const { width: pageWidth } = await page.viewportSize(),
        from = await page.evaluate(() => ({
          visible: Math.round(window.testState.intersectable.rect.value.visible.width),
          bounding: Math.round(window.testState.intersectable.rect.value.bounding.width),
          viewport: Math.round(window.testState.intersectable.rect.value.viewport.width),
        }))
  expected.from = {
    visible: 0,
    bounding: 100,
    viewport: pageWidth,
  }

  assert.equal(from, expected.from)

  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)
  const to = await page.evaluate(() => ({
    visible: Math.round(window.testState.intersectable.rect.value.visible.width),
    bounding: Math.round(window.testState.intersectable.rect.value.bounding.width),
    viewport: Math.round(window.testState.intersectable.rect.value.viewport.width),
  }))
  expected.to = {
    visible: 100,
    bounding: 100,
    viewport: pageWidth,
  }

  assert.equal(to, expected.to)

  reloadNext()

  reloadNext()
})

suite('reactively tracks ratio', async ({ playwright: { page, reloadNext } }) => {
  await page.goto('http:/localhost:5173/useIntersection/withoutOptions')
  await page.waitForSelector('span', { state: 'attached' })
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)

  const expected: any = {}

  const from = await page.evaluate(() => window.testState.intersectable.ratio.value)
  expected.from = 0

  assert.is(from, expected.from)

  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)
  const to = await page.evaluate(() => window.testState.intersectable.ratio.value)
  expected.to = 1

  assert.equal(to, expected.to)

  reloadNext()
})

suite('reactively tracks status', async ({ playwright: { page, reloadNext } }) => {
  await page.goto('http:/localhost:5173/useIntersection/withoutOptions')
  await page.waitForSelector('span', { state: 'attached' })
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)

  const expected: any = {}

  const from = await page.evaluate(() => window.testState.intersectable.status.value)
  expected.from = 'invisible'

  assert.is(from, expected.from)

  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)
  const to = await page.evaluate(() => window.testState.intersectable.status.value)
  expected.to = 'visible'

  assert.equal(to, expected.to)

  reloadNext()
})

suite('reactively tracks time', async ({ playwright: { page, reloadNext } }) => {
  await page.goto('http:/localhost:5173/useIntersection/withoutOptions')
  await page.waitForSelector('span', { state: 'attached' })
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)

  const from = await page.evaluate(() => window.testState.intersectable.time.value)

  assert.ok(from > 0)

  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)
  const to = await page.evaluate(() => window.testState.intersectable.time.value)

  assert.ok(to > from)

  reloadNext()
})

suite('respects observer option', async ({ playwright: { page, reloadNext } }) => {
  await page.goto('http:/localhost:5173/useIntersection/withOptions')
  await page.waitForSelector('span', { state: 'attached' })
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)

  const expected: any = {}

  const from = await page.evaluate(() => ({
    visible: Math.round(window.testState.intersectable.rect.value.visible.width),
    bounding: Math.round(window.testState.intersectable.rect.value.bounding.width),
    viewport: Math.round(window.testState.intersectable.rect.value.viewport.width),
  }))
  expected.from = {
    visible: 0,
    bounding: 100,
    viewport: 198,
  }

  assert.equal(from, expected.from)

  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(mockIntersectionObserverEventLoopTiming)
  const to = await page.evaluate(() => ({
    visible: Math.round(window.testState.intersectable.rect.value.visible.width),
    bounding: Math.round(window.testState.intersectable.rect.value.bounding.width),
    viewport: Math.round(window.testState.intersectable.rect.value.viewport.width),
  }))
  expected.to = {
    visible: 100,
    bounding: 100,
    viewport: 198,
  }

  assert.equal(to, expected.to)

  reloadNext()
})


suite.run()
