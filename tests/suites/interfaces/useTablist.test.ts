import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useTablist')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
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
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')
  const horizontal = await page.evaluate(async () => document.querySelector('div').getAttribute('aria-orientation'))
  assert.is(horizontal, 'horizontal')

  await page.goto('http://localhost:3000/useTablist/vertical')
  await page.waitForSelector('div')
  const vertical = await page.evaluate(async () => document.querySelector('div').getAttribute('aria-orientation'))
  assert.is(vertical, 'vertical')
})

suite(`only selected tab is focusable`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const value = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div div')],
          tabs = divs.slice(0, 3)
    
    return tabs.map(el => el.getAttribute('tabindex'))
  })
  assert.equal(value, ['0', '-1', '-1'])
})

suite(`tabs' aria-controls match panels' IDs`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
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
  await page.goto('http://localhost:3000/useTablist/horizontal')
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

suite(`selected tab's aria-selected is true and others are undefined`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const tabs = await page.evaluate(async () => {
          const divs = [...document.querySelectorAll('div div')],
                tabs = divs.slice(0, 3)
          
          return tabs.map(el => el.getAttribute('aria-selected'))
        })

  assert.equal(tabs, ['true', undefined, undefined])
})

suite(`selected tab's panel is shown and others are hidden`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const panels = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                panels = divs.slice(3)
          
          return panels.map(el => window.getComputedStyle(el).display)
        })

  assert.equal(panels, ['block', 'none', 'none'])
})

suite(`selected tab's panel's aria-hidden is undefined and others are true`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const panels = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                panels = divs.slice(3)
          
          return panels.map(el => el.getAttribute('aria-hidden'))
        })

  assert.equal(panels, [null, 'true', 'true'])
})

suite(`selected tab and is.selected functions react to tablist.selected`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          const divs = [...document.querySelectorAll('div div')],
                tabs = divs.slice(0, 3),
                from = {
                  tabs: tabs.map(el => el.getAttribute('aria-selected')),
                  is: {
                    selected: (window as unknown as WithGlobals).testState.tablist.is.selected(1),
                  },
                };
          
          (window as unknown as WithGlobals).testState.tablist.select.exact(1)
          await (window as unknown as WithGlobals).nextTick()
          
          const to = {
            tabs: tabs.map(el => el.getAttribute('aria-selected')),
            is: {
              selected: (window as unknown as WithGlobals).testState.tablist.is.selected(1),
            },
          }
          
          return { from, to }
        })

  assert.equal(value.from.tabs, ['true', undefined, undefined])
  assert.equal(value.from.is.selected, false)
  assert.equal(value.to.tabs, [undefined, 'true', undefined])
  assert.equal(value.to.is.selected, true)
})

suite(`respects initialSelected option`, async ({ puppeteer: { page } }) => {
  // Separate route for this one, because initial selection throws off the arithmetic on all the other withOptions tests
  await page.goto('http://localhost:3000/useTablist/withInitialSelected')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.tablist.selected
        }),
        expected = 1

  assert.is(value, expected)
})

suite(`mousedown on a tab navigates to that tab`, async ({ puppeteer: { page, mouseClick } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.tablist.selected)
  await mouseClick('div div:nth-child(2)')
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.tablist.selected)

  assert.is(from, 0)
  assert.is(to, 1)
})

suite(`when selectsTabOnFocus is false, selected does not reacted to focused`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/withOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => document.querySelector('input').focus())
  await page.keyboard.press('Tab')

  const value = await page.evaluate(async () => {
          const divs = [...document.querySelectorAll('div div')],
                tabs = divs.slice(0, 3),
                from = tabs.map(el => `${document.activeElement.isSameNode(el)}`);
          
          (window as unknown as WithGlobals).testState.tablist.focus.exact(1)
          await (window as unknown as WithGlobals).nextTick()
          
          const to = tabs.map(el => `${document.activeElement.isSameNode(el)}`)
          
          return { from, to }
        })

  assert.equal(value.from, ['true', undefined, undefined])
  assert.equal(value.to, [undefined, 'true', undefined])
})

suite(`when selectsTabOnFocus is false, click selects a tab`, async ({ puppeteer: { page, mouseClick } }) => {
  await page.goto('http://localhost:3000/useTablist/withOptions')
  await page.waitForSelector('div')

  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.tablist.selected)
  await mouseClick('div div:nth-child(2)')
  const to = await page.evaluate(async () => (window as unknown as WithGlobals).testState.tablist.selected)

  assert.is(from, 0)
  assert.is(to, 1)
})

suite(`when selectsTabOnFocus is false, spacebar selects the focused tab`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/withOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => document.querySelector('input').focus())
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')

  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.tablist.selected)
  await page.keyboard.press(' ')
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.tablist.selected)

  assert.is(from, 0)
  assert.is(to, 1)
})

suite(`when selectsTabOnFocus is false, enter key selects the focused tab`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/withOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => document.querySelector('input').focus())
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')

  const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.tablist.selected)
  await page.keyboard.press('Enter')
  const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.tablist.selected)

  assert.is(from, 0)
  assert.is(to, 1)
})

suite.run()
