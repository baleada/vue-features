import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useHead')
)

suite(`sets title`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHead/title')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.title
        }),
        expected = 'Title'

  assert.is(value, expected)
})

suite(`updates title reactively`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHead/title')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.title.value = 'stub'
          await (window as unknown as WithGlobals).nextTick()
          return document.title
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`sets metas`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHead/metas')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('meta')]
            .slice(2) // remove viewport and charset metas
            .map(meta => ({
              property: meta.getAttribute('property'),
              content: meta.getAttribute('content'),
            }))
        }),
        expected = [
          { property: 'og:title', content: 'stub' },
          { property: 'og:description', content: 'stub' },
        ]

  assert.equal(value, expected)
})

suite(`updates metas reactively`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHead/metas')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.description.value = 'example'
          await (window as unknown as WithGlobals).nextTick()
          return [...document.querySelectorAll('meta')]
            .slice(2) // remove viewport and charset metas
            .map(meta => ({
              property: meta.getAttribute('property'),
              content: meta.getAttribute('content'),
            }))
        }),
        expected = [
          { property: 'og:title', content: 'stub' },
          { property: 'og:description', content: 'example' },
        ]

  assert.equal(value, expected)
})

suite(`resets title onBeforeUnmount`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHead/Parent')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.childIsMounted.value = true
          await (window as unknown as WithGlobals).nextTick()
          ;(window as unknown as WithGlobals).testState.childIsMounted.value = false
          await (window as unknown as WithGlobals).nextTick()
          return document.title
        }),
        expected = 'cachedStub'

  assert.is(value, expected)
})

suite(`removes metas onBeforeUnmount`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHead/Parent')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.childIsMounted.value = true
          await (window as unknown as WithGlobals).nextTick()
          ;(window as unknown as WithGlobals).testState.childIsMounted.value = false
          await (window as unknown as WithGlobals).nextTick()
          return [...document.querySelectorAll('meta')]
            .slice(2) // remove viewport and charset metas
            .length
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
