import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import type { W } from '../window'

const suite = withPuppeteer(
  createSuite('useTarget (browser)')
)

suite(`returns single target with handle`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTarget/single')
  await page.waitForSelector('span')

  const expected: any = {}

  // @ts-ignore
  const from = await page.evaluate(async () => window.TEST.target.value)
  expected.from = null

  assert.is(from, expected.from)
  
  const to = await page.evaluate(async () => {
    // @ts-ignore
    window.TEST.handle(window.TEST.stub.value)
    // @ts-ignore
    await window.nextTick()
    // @ts-ignore
    return window.TEST.target.value.tagName
  })
  expected.to = 'SPAN'

  assert.is(to, expected.to)
})

suite(`returns multiple targets with handle`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTarget/multiple')
  await page.waitForSelector('span')

  const expected: any = {}

  // @ts-ignore
  const from = await page.evaluate(async () => [...window.TEST.targets.value])
  expected.from = []

  assert.equal(from, expected.from)
  
  
  const to = await page.evaluate(async () => {
    // @ts-ignore
    window.TEST.handle(0)(window.TEST.stub0.value)
    // @ts-ignore
    window.TEST.handle(1)(window.TEST.stub1.value)
    // @ts-ignore
    window.TEST.handle(2)(window.TEST.stub2.value)
    // @ts-ignore
    await window.nextTick()
    // @ts-ignore
    return window.TEST.targets.value.map(target => target.className)
  })
  expected.to = ['0', '1', '2']

  assert.equal(to, expected.to)
})

suite.run()
