import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useTablist (browser')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const tablist = await page.evaluate(() => document.querySelector('div').getAttribute('aria-role'))
  assert.is(tablist, 'tablist')

  const tabs = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div div')],
          tabs = divs.slice(0, 3)
    
    return tabs.map(el => el.getAttribute('aria-role'))
  })
  assert.equal(tabs, (new Array(3)).fill('tab'))

  const panels = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div div')],
          panels = divs.slice(3)
    
    return panels.map(el => el.getAttribute('aria-role'))
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

suite(`tabs are focusable`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const tabs = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div div')],
          tabs = divs.slice(0, 3)
    
    return tabs.map(el => el.getAttribute('tabindex'))
  })
  assert.equal(tabs, (new Array(3)).fill('0'))
})

suite(`label's ID matches tablist's aria-labelledby`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const labelId = await page.evaluate(async () => document.querySelector('span').id),
        tablistAriaLabelledby = await page.evaluate(async () => document.querySelector('div').getAttribute('aria-labelledby')),
        value = labelId,
        expected = tablistAriaLabelledby

  assert.is(value, expected)
  assert.ok(tablistAriaLabelledby)
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

suite(`tabs' aria-haspopup is false by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const tabs = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                tabs = divs.slice(0, 3)
          
          return tabs.map(el => el.getAttribute('aria-haspopup'))
        })

  assert.equal(tabs, (new Array(3)).fill('false'))
})

suite(`selected tab's aria-selected is true and others are false`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const tabs = await page.evaluate(() => {
          const divs = [...document.querySelectorAll('div div')],
                tabs = divs.slice(0, 3)
          
          return tabs.map(el => el.getAttribute('aria-selected'))
        })

  assert.equal(tabs, ['true', 'false', 'false'])
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

suite(`selected tab and panel react to navigateable`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          const divs = [...document.querySelectorAll('div div')],
                tabs = divs.slice(0, 3),
                panels = divs.slice(3),
                from = {
                  tabs: tabs.map(el => el.getAttribute('aria-selected')),
                  panels: panels.map(el => window.getComputedStyle(el).display),
                }
          
          window.TEST.tablist.navigateable.navigate(1)
          await window.nextTick()
          
          const to = {
            tabs: tabs.map(el => el.getAttribute('aria-selected')),
            panels: panels.map(el => window.getComputedStyle(el).display),
          }
          
          return { from, to }
        })

  assert.equal(value.from.tabs, ['true', 'false', 'false'])
  assert.equal(value.from.panels, ['block', 'none', 'none'])
  assert.equal(value.to.tabs, ['false', 'true', 'false'])
  assert.equal(value.to.panels, ['none', 'block', 'none'])
})

suite(`clicking a tab navigates to that tab`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  const from = await page.evaluate(() => window.TEST.tablist.navigateable.location)
  await page.click('div div:nth-child(2)')
  const to = await page.evaluate(() => window.TEST.tablist.navigateable.location)

  assert.is(from, 0)
  assert.is(to, 1)
})

suite(`when focus transfers to the first tab via the keyboard, the selected tab is focused instead`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    window.TEST.tablist.navigateable.navigate(1)
    await window.nextTick()
    document.querySelector('input').focus()
  })
  await page.keyboard.press('Tab')
  const value = await page.evaluate(async () => document.activeElement.textContent)

  assert.is(value, 'Tab #2')
})

suite(`when the tablist is horizontal, left and right arrow keys control tab focus`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  await page.evaluate(async () => document.querySelector('input').focus())
  await page.keyboard.press('Tab')

  await page.keyboard.press('ArrowRight')
  const afterRight = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(afterRight, 'Tab #2')

  await page.keyboard.press('ArrowLeft')
  const afterLeft = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(afterLeft, 'Tab #1')
})

suite(`when the tablist is horizontal, up and down arrow keys do not control tab focus`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  await page.evaluate(async () => document.querySelector('input').focus())
  await page.keyboard.press('Tab')

  await page.keyboard.press('ArrowDown')
  const afterDown = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(afterDown, 'Tab #1')

  await page.keyboard.press('ArrowUp')
  const afterUp = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(afterUp, 'Tab #1')
})

suite(`when the tablist is vertical, up and down arrow keys control tab focus`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/vertical')
  await page.waitForSelector('div')

  await page.evaluate(async () => document.querySelector('input').focus())
  await page.keyboard.press('Tab')

  await page.keyboard.press('ArrowDown')
  const afterDown = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(afterDown, 'Tab #2')

  await page.keyboard.press('ArrowUp')
  const afterUp = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(afterUp, 'Tab #1')
})

suite(`when the tablist is vertical, left and right arrow keys do not control tab focus`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/vertical')
  await page.waitForSelector('div')

  await page.evaluate(async () => document.querySelector('input').focus())
  await page.keyboard.press('Tab')

  await page.keyboard.press('ArrowRight')
  const afterRight = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(afterRight, 'Tab #1')

  await page.keyboard.press('ArrowLeft')
  const afterLeft = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(afterLeft, 'Tab #1')
})

suite(`home key focuses first tab`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  await page.click('div div:nth-child(3)')
  
  await page.keyboard.press('Home')
  const value = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(value, 'Tab #1')
})

suite(`end key focuses first tab`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('div')

  await page.click('div div:nth-child(1)')
  
  await page.keyboard.press('End')
  const value = await page.evaluate(async () => document.activeElement.textContent)
  assert.is(value, 'Tab #3')
})

suite.run()
