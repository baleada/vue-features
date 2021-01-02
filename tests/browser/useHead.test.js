import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useHead (browser)')
)

suite(`sets title`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useHead/title')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.title
        }),
        expected = 'Title'

  assert.is(value, expected)
})

suite(`updates title reactively`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useHead/title')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          window.TEST.title.value = 'stub'
          await window.nextTick()
          return document.title
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`sets metas`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useHead/metas')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('meta')]
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
  await page.goto('http://localhost:3000/useHead/metas')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          window.TEST.description.value = 'example'
          await window.nextTick()
          return [...document.querySelectorAll('meta')]
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
  await page.goto('http://localhost:3000/useHead/Parent')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          window.TEST.childIsMounted.value = true
          await window.nextTick()
          window.TEST.childIsMounted.value = false
          await window.nextTick()
          return document.title
        }),
        expected = 'cachedStub'

  assert.is(value, expected)
})

suite(`removes metas onBeforeUnmount`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useHead/Parent')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          window.TEST.childIsMounted.value = true
          await window.nextTick()
          window.TEST.childIsMounted.value = false
          await window.nextTick()
          return [...document.querySelectorAll('meta')].length
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
