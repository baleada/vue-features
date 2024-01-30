import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useModal')
)

suite('open() opens dialog', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open()
    await window.nextTick()
    return window.testState.modal.dialog.status.value
  })

  assert.is(value, 'opened')
})

suite('close() closes dialog', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open()
    await window.nextTick()
    window.testState.modal.dialog.close()
    await window.nextTick()
    return window.testState.modal.dialog.status.value
  })

  assert.is(value, 'closed')
})

suite('button interactions open dialog', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await (async () => {
    await page.focus('button')
    await page.keyboard.press('Enter')

    const value = await page.evaluate(() => window.testState.modal.dialog.status.value),
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
    return window.testState.modal.dialog.status.value
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

suite('contains focus when tabbing before first focusable', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.modal.dialog.open()
    await window.nextTick()
  })

  await page.keyboard.down('Shift')
  await tab({ direction: 'backward', total: 1 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'last focusable')
})

suite('contains focus when tabbing past last focusable', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.modal.dialog.open()
    await window.nextTick()
  })

  // Tab past the first focusable and the button to open stacked modal
  // and the last focusable, back to the first focusable.
  await tab({ direction: 'forward', total: 3 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'first focusable')
})

suite.run()
