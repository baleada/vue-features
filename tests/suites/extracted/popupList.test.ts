import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toOptionsParam'

const suite = withPlaywright(
  createSuite('popupCombo')
)

suite('controller aria-expanded is true when popup is opened', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/popupList')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.select.listbox.open()
          await window.nextTick()
          return window.testState.select.button.root.element.value.getAttribute('aria-expanded')
        }),
        expected = 'true'

  assert.is(value, expected)
})

suite('controller aria-controls is popup ID when popup is opened', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/popupList')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.select.listbox.open()
          await window.nextTick()
          return window.testState.select.button.root.element.value.getAttribute('aria-controls') === window.testState.select.listbox.root.element.value.id
        })

  assert.ok(value)
})

suite('popup closes when focus moves from controller to non-popup', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/popupList')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.select.listbox.open()
  })
  
  {
    await tab({ direction: 'forward', total: 1 }) // focus is on listbox
    const value = await page.evaluate(() => window.testState.select.listbox.is.closed())

    assert.ok(value)
  }

  await page.evaluate(async () => {
    window.testState.select.listbox.open()
  })
  
  {
    await tab({ direction: 'backward', total: 1 })
    const value = await page.evaluate(() => window.testState.select.listbox.is.opened())

    assert.ok(value)
  }

  {
    await tab({ direction: 'backward', total: 1 })
    const value = await page.evaluate(() => window.testState.select.listbox.is.closed())

    assert.ok(value)
  }
})

suite('closes popup and focuses controller on esc', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/popupList')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => {
    window.testState.select.listbox.open()
  })

  await page.keyboard.press('Escape')

  const value = await page.evaluate(async () => {
          return [
            window.testState.select.listbox.is.closed(),
            window.testState.select.button.root.element.value === document.activeElement,
          ]
        }),
        expected = [true, true]

  assert.equal(value, expected)
})

suite('closes popup and focuses controller on esc after leave transition', async ({ playwright: { page } }) => {
  const options = {
    popup: {
      rendering: {
        show: {
          transition: {
            leave: {
              from: 'opacity-100',
              to: 'opacity-0',
              active: 'duration-100',
            },
          },
        },
      },
    },
  }
  await page.goto(`http://localhost:5173/popupList${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => {
    window.testState.select.listbox.open()
  })

  await page.keyboard.press('Escape')

  {
    const value = await page.evaluate(async () => {
            return [
              window.testState.select.listbox.is.closed(),
              window.testState.select.listbox.is.removing(),
              window.testState.select.button.root.element.value === document.activeElement,
            ]
          }),
          expected = [true, true, false]

    assert.equal(value, expected)
  }
  
  {
    await page.waitForTimeout(150)
    const value = await page.evaluate(async () => {
            return [
              window.testState.select.listbox.is.closed(),
              window.testState.select.listbox.is.removed(),
              window.testState.select.button.root.element.value === document.activeElement,
            ]
          }),
          expected = [true, true, true]

    assert.equal(value, expected)
  }
})

suite.run()
