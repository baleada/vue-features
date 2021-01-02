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
          await window.nextTick()
          return document.title
        }),
        expected = 'Title'

  assert.is(value, expected)
})

suite(`updates title reactively`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useHead/title')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          await window.nextTick()
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
          await window.nextTick()
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
          await window.nextTick()
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

suite.run()
