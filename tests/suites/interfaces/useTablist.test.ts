import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useTablist')
)

suite('correctly assigns aria roles', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div', { state: 'attached' })

  const tablist = await page.evaluate(() => window.testState.tablist.root.element.value.getAttribute('role'))
  assert.is(tablist, 'tablist')

  const tabs = await page.evaluate(() => (
    window.testState.tablist.tabs.list.value.map(el => el.getAttribute('role'))
  ))
  assert.equal(tabs, (new Array(3)).fill('tab'))

  const panels = await page.evaluate(() => (
    window.testState.tablist.panels.list.value.map(el => el.getAttribute('role'))
  ))
  assert.equal(panels, (new Array(3)).fill('tabpanel'))
})

suite('tabs\' aria-controls match panels\' IDs', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div', { state: 'attached' })

  const tabs = await page.evaluate(() => {
          return window.testState.tablist.tabs.list.value.map(el => el.getAttribute('aria-controls'))
        }),
        panels = await page.evaluate(() => {
          return window.testState.tablist.panels.list.value.map(el => el.getAttribute('id'))
        })

  assert.equal(tabs, panels)
})

suite('tabs\' IDs match panels\' aria-labelledby', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div', { state: 'attached' })

  const tabs = await page.evaluate(() => {
          return window.testState.tablist.tabs.list.value.map(el => el.getAttribute('id'))
        }),
        panels = await page.evaluate(() => {
          return window.testState.tablist.panels.list.value.map(el => el.getAttribute('aria-labelledby'))
        })

  assert.equal(tabs, panels)
})

suite('selected tab\'s panel is shown and others are hidden', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div', { state: 'attached' })

  const panels = await page.evaluate(() => {
    return window.testState.tablist.panels.list.value.map(el => window.getComputedStyle(el).display)
  })

  assert.equal(panels, ['block', 'none', 'none'])
})

suite('selected tab\'s panel\'s inert is removed and others are true', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div', { state: 'attached' })

  const panels = await page.evaluate(() => {
    return window.testState.tablist.panels.list.value.map(el => el.inert)
  })

  assert.equal(panels, [false, true, true])
})

suite('selected panel\'s tabindex is 0 when it does not contain a focusable element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/horizontal')
  await page.waitForSelector('div', { state: 'attached' })

  const panels = await page.evaluate(() => {
    return window.testState.tablist.panels.list.value.map(el => el.getAttribute('tabindex'))
  })

  assert.equal(panels, ['0', null, null])
})

suite('panels\' tabindex is not set when it contains a focusable element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTablist/focusability')
  await page.waitForSelector('div', { state: 'attached' })

  const panels = await page.evaluate(() => {
    return window.testState.tablist.panels.list.value.map(el => el.getAttribute('tabindex'))
  })

  assert.equal(panels, [null, null, null])
})

suite.run()
