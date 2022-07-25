import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useTablist')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div')

  const tablist = await page.evaluate(() => document.querySelector('div').getAttribute('role'))
  assert.is(tablist, 'tablist')

  const tabs = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div div')],
          tabs = divs.slice(0, 3)
    
    return tabs.map(el => el.getAttribute('role'))
  })
  assert.equal(tabs, (new Array(3)).fill('tab'))

  const panels = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div div')],
          panels = divs.slice(3)
    
    return panels.map(el => el.getAttribute('role'))
  })
  assert.equal(panels, (new Array(3)).fill('tabpanel'))
})

suite(`aria-orientation is correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div')
  const horizontal = await page.evaluate(async () => document.querySelector('div').getAttribute('aria-orientation'))
  assert.is(horizontal, 'horizontal')

  await page.goto('http://localhost:5173/useTablist/vertical')
  await page.waitForSelector('div')
  const vertical = await page.evaluate(async () => document.querySelector('div').getAttribute('aria-orientation'))
  assert.is(vertical, 'vertical')
})

suite(`tabs' aria-controls match panels' IDs`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div')

  const tabs = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                tabs = divs.slice(0, 3)
          
          return tabs.map(el => el.getAttribute('aria-controls'))
        }),
        panels = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                panels = divs.slice(3)
          
          return panels.map(el => el.getAttribute('id'))
        })

  assert.equal(tabs, panels)
})

suite(`tabs' IDs match panels' aria-labelledby`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div')

  const tabs = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                tabs = divs.slice(0, 3)
          
          return tabs.map(el => el.getAttribute('id'))
        }),
        panels = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                panels = divs.slice(3)
          
          return panels.map(el => el.getAttribute('aria-labelledby'))
        })

  assert.equal(tabs, panels)
})

suite(`selected tab's panel is shown and others are hidden`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div')

  const panels = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                panels = divs.slice(3)
          
          return panels.map(el => window.getComputedStyle(el).display)
        })

  assert.equal(panels, ['block', 'none', 'none'])
})

suite(`selected tab's panel's aria-hidden is removed and others are true`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div')

  const panels = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                panels = divs.slice(3)
          
          return panels.map(el => el.getAttribute('aria-hidden'))
        })

  assert.equal(panels, [null, 'true', 'true'])
})

suite.run()
