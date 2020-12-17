import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useTablist (browser')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('#test')

  const tablist = await page.evaluate(() => document.querySelector('#test div').getAttribute('aria-role'))
  assert.is(tablist, 'tablist')

  const tabs = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('#test div div')],
          tabs = divs.slice(0, 3)
    
    return tabs.map(el => el.getAttribute('aria-role'))
  })
  assert.ok(tabs.every(role => role === 'tab'))

  const panels = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('#test div div')],
          panels = divs.slice(3)
    
    return panels.map(el => el.getAttribute('aria-role'))
  })
  assert.ok(panels.every(role => role === 'tabpanel'))
})

suite(`label's ID matches tablist's aria-labelledby`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablist/horizontal')
  await page.waitForSelector('#test')

  const labelId = await page.evaluate(async () => document.querySelector('#test span').id),
        tablistAriaLabelledby = await page.evaluate(async () => document.querySelector('#test div').getAttribute('aria-labelledby')),
        value = labelId,
        expected = tablistAriaLabelledby

  assert.is(value, expected)
  assert.ok(tablistAriaLabelledby)
})

suite.run()
