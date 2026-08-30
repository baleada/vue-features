import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import {
  withPlaywrightOptions,
} from '../../fixtures/withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('useModal'),
  withPlaywrightOptions
)

suite('open() works', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open()
    await window.nextTick()
    return window.testState.modal.dialog.popupStatus.value
  })

  assert.is(value, 'opened')
})

suite('close() works', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open()
    await window.nextTick()
    window.testState.modal.dialog.close()
    await window.nextTick()
    return window.testState.modal.dialog.popupStatus.value
  })

  assert.is(value, 'closed')
})

suite('button interactions open dialog', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await (async () => {
    await page.focus('button')
    await page.keyboard.press('Enter')

    const value = await page.evaluate(() => window.testState.modal.dialog.popupStatus.value),
          expected = 'opened'

    assert.is(value, expected)
  })()

  await page.evaluate(() => window.testState.modal.dialog.close())
})

suite('esc closes dialog', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.modal.dialog.open()
    await window.nextTick()
  })

  await page.keyboard.press('Escape')

  const value = await page.evaluate(() => {
    return window.testState.modal.dialog.popupStatus.value
  })

  assert.is(value, 'closed')
})

suite('focuses first focusable when opened', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open()
    await window.nextTick()
    await window.nextTick()
    return document.activeElement.textContent
  })

  assert.is(value, 'first focusable')
})

suite('focuses has popup by default when closed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })
  await page.focus('button')

  const value = await page.evaluate(async () => {
          window.testState.modal.dialog.open()
          await window.nextTick()
          window.testState.modal.dialog.close()
          await window.nextTick()
          return document.activeElement.textContent.trim()
        }),
        expected = 'has popup'

  assert.is(value, expected)
})

suite('defers focus until the press that opened the dialog is released', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.hover('button')
  await page.mouse.down()

  const whilePressed = await page.evaluate(async () => {
    await window.nextTick()
    await window.nextTick()
    return document.activeElement.textContent.trim()
  })

  assert.is(whilePressed, 'has popup')

  await page.mouse.up()

  const afterRelease = await page.evaluate(async () => {
    await window.nextTick()
    return document.activeElement.textContent.trim()
  })

  assert.is(afterRelease, 'first focusable')
})

suite('abandons deferred focus when something else claims focus during the press', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.hover('button')
  await page.mouse.down()

  // Wait for the deferral to be armed, then move focus the way a nested popup
  // opening inside the dialog would.
  await page.evaluate(async () => {
    await window.nextTick()
    await window.nextTick()
    ;([...document.querySelectorAll('button')]
      .find(button => button.textContent.trim() === 'open stacked modal') as HTMLElement)
      .focus()
  })

  await page.mouse.up()

  const value = await page.evaluate(async () => {
          await window.nextTick()
          return document.activeElement.textContent.trim()
        }),
        expected = 'open stacked modal'

  assert.is(value, expected)
})

suite('deferred focus does not steal focus from a popup stacked on the dialog', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withStackedSelect')
  await page.waitForSelector('div', { state: 'attached' })

  await page.hover('button')
  await page.mouse.down()

  // Wait for the dialog's deferred focus to be armed, then open a stacked
  // listbox, which takes focus for itself.
  await page.evaluate(async () => {
    await window.nextTick()
    await window.nextTick()
    window.testState.select.listbox.open()
    await window.nextTick()
    await window.nextTick()
  })

  await page.mouse.up()

  const value = await page.evaluate(async () => {
          await window.nextTick()
          return window.testState.select.listbox.options.list.value
            .findIndex(element => element === document.activeElement)
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
