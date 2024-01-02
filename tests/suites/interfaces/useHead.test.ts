import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useHead')
)

suite(`sets title`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHead/title')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return document.title
        }),
        expected = 'Title'

  assert.is(value, expected)
})

suite(`updates title reactively`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHead/title')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.title.value = 'stub'
          await window.nextTick()
          return document.title
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`sets metas`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHead/metas')
  await page.waitForSelector('span', { state: 'attached' })

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

suite(`updates metas reactively`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHead/metas')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.description.value = 'example'
          await window.nextTick()
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

suite(`resets title onBeforeUnmount`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHead/Parent')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.childIsMounted.value = true
          await window.nextTick()
          window.testState.childIsMounted.value = false
          await window.nextTick()
          return document.title
        }),
        expected = 'cachedStub'

  assert.is(value, expected)
})

suite(`removes metas onBeforeUnmount`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHead/Parent')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.childIsMounted.value = true
          await window.nextTick()
          window.testState.childIsMounted.value = false
          await window.nextTick()
          return [...document.querySelectorAll('meta')]
            .slice(2) // remove viewport and charset metas
            .length
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
