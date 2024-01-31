import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toOptionsParam'

const suite = withPlaywright(
  createSuite('useMenubar')
)

suite('assigns aria roles', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenubar')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [
            window.testState.menubar.root.element.value.getAttribute('role'),
            window.testState.menubar.items.list.value.map(item => item.getAttribute('role')),
          ]
        }),
        expected = [
          'menu',
          [
            'menuitem',
            'menuitem',
            'menuitemcheckbox',
            'menuitemcheckbox',
            'menuitemradio',
            'menuitemradio',
          ],
        ]

  assert.equal(value, expected)
})

suite('respects visuallyPersists option', async ({ playwright: { page } }) => {
  const options = {
    visuallyPersists: true,
  }  
  await page.goto(`http://localhost:5173/useMenubar${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.menubar.root.element.value.getAttribute('role')
        }),
        expected = 'menubar'

  assert.is(value, expected)
})

suite('binds aria-checked', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenubar')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.menubar.select.exact([2, 4])
          await window.nextTick()
          return window.testState.menubar.items.list.value.map(item => item.getAttribute('aria-checked'))
        }),
        expected = [
          null,
          null,
          'true',
          'false',
          'true',
          'false',
        ]

  assert.equal(value, expected)
})

suite.run()
