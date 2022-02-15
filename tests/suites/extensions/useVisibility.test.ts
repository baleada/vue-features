import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useVisibility')
)

suite(`reactively tracks rect`, async ({ puppeteer: { page, reloadNext } }) => {
  await page.goto('http:/localhost:3000/useVisibility/withoutOptions')
  await page.waitForSelector('span')

  const expected: any = {}

  const { width: pageWidth } = await page.viewport(),
        from = await page.evaluate(() => ({
          visible: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.visible.width),
          bounding: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.bounding.width),
          viewport: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.viewport.width),
        }))
  expected.from = {
    visible: 0,
    bounding: 84,
    viewport: pageWidth,
  }

  assert.equal(from, expected.from)
  
  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(20)
  const to = await page.evaluate(() => ({
          visible: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.visible.width),
          bounding: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.bounding.width),
          viewport: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.viewport.width),
        }))
  expected.to = {
    visible: 84,
    bounding: 84,
    viewport: pageWidth,
  }

  assert.equal(to, expected.to)

  reloadNext()

  reloadNext()
})

suite(`reactively tracks ratio`, async ({ puppeteer: { page, reloadNext } }) => {
  await page.goto('http:/localhost:3000/useVisibility/withoutOptions')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.visibility.ratio.value)
  expected.from = 0

  assert.is(from, expected.from)
  
  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(20)
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.visibility.ratio.value)
  expected.to = 1

  assert.equal(to, expected.to)

  reloadNext()
})

suite(`reactively tracks status`, async ({ puppeteer: { page, reloadNext } }) => {
  await page.goto('http:/localhost:3000/useVisibility/withoutOptions')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.visibility.status.value)
  expected.from = 'invisible'

  assert.is(from, expected.from)
  
  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(20)
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.visibility.status.value)
  expected.to = 'visible'

  assert.equal(to, expected.to)

  reloadNext()
})

suite(`reactively tracks isVisible`, async ({ puppeteer: { page, reloadNext } }) => {
  await page.goto('http:/localhost:3000/useVisibility/withoutOptions')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.visibility.isVisible.value)
  expected.from = false

  assert.is(from, expected.from)
  
  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(20)
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.visibility.isVisible.value)
  expected.to = true

  assert.equal(to, expected.to)

  reloadNext()
})

suite(`reactively tracks time`, async ({ puppeteer: { page, reloadNext } }) => {
  await page.goto('http:/localhost:3000/useVisibility/withoutOptions')
  await page.waitForSelector('span')

  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.visibility.time.value)

  assert.ok(from > 0)
  
  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(20)
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.visibility.time.value)

  assert.ok(to > from)

  reloadNext()
})

suite(`respects observer option`, async ({ puppeteer: { page, reloadNext } }) => {
  await page.goto('http:/localhost:3000/useVisibility/withOptions')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(() => ({
          visible: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.visible.width),
          bounding: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.bounding.width),
          viewport: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.viewport.width),
        }))
  expected.from = {
    visible: 0,
    bounding: 84,
    viewport: 198,
  }

  assert.equal(from, expected.from)
  
  await page.evaluate(() => document.querySelector('span').scrollIntoView())
  await page.waitForTimeout(20)
  const to = await page.evaluate(() => ({
          visible: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.visible.width),
          bounding: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.bounding.width),
          viewport: Math.round((window as unknown as WithGlobals).testState.visibility.rect.value.viewport.width),
        }))
  expected.to = {
    visible: 84,
    bounding: 84,
    viewport: 198,
  }

  assert.equal(to, expected.to)

  reloadNext()
})


suite.run()
