import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useModal')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')

  const dialog = await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick();
    return window.testState.modal.dialog.root.element.value.getAttribute('role')
  })
  
  assert.is(dialog, 'dialog')

  const button = await page.evaluate(() => {
    return window.testState.modal.button.root.element.value.getAttribute('aria-haspopup')
  })

  assert.is(button, 'dialog')
})

suite(`alertdialog role is optionally assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useModal/alert')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick();
    return window.testState.modal.dialog.root.element.value.getAttribute('role')
  })

  assert.is(value, 'alertdialog')
})

suite(`open() opens dialog`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick();
    return window.testState.modal.dialog.status.value
  })

  assert.is(value, 'opened')
})

suite(`close() closes dialog`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick()
    window.testState.modal.dialog.close();
    await window.nextTick();
    return window.testState.modal.dialog.status.value
  })

  assert.is(value, 'closed')
})

suite(`button interactions open dialog`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')

  const buttonRect: DOMRect = await page.evaluate(() => {
    return JSON.parse(JSON.stringify(document.querySelector('button').getBoundingClientRect()))
  })
  await page.mouse.move(buttonRect.x, buttonRect.y)
  await page.mouse.down()
  await page.mouse.up()
  const mousedown = await page.evaluate(() => window.testState.modal.dialog.status.value)
  assert.is(mousedown, 'opened')

  await page.evaluate(() => window.testState.modal.dialog.close())

  await page.keyboard.press('Enter')
  const enter = await page.evaluate(() => window.testState.modal.dialog.status.value)
  assert.is(enter, 'opened')

  await page.evaluate(() => window.testState.modal.dialog.close())

  await page.keyboard.press('Space')
  const space = await page.evaluate(() => window.testState.modal.dialog.status.value)
  assert.is(space, 'opened')
})

suite(`esc closes dialog`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick();
  })

  await page.keyboard.press('Escape')

  const value = await page.evaluate(() => {
    return window.testState.modal.dialog.status.value
  })

  assert.is(value, 'closed')
})

suite(`focuses first focusable when opened`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick();
    await window.nextTick();
    return document.activeElement.textContent
  })

  assert.is(value, 'first focusable')
})

suite(`focuses has popup by default when closed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')
  await page.focus('button')

  const value = await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick()
    window.testState.modal.dialog.close();
    await window.nextTick();
    return document.activeElement.textContent
  })

  assert.is(value, 'has popup')
})

suite(`contains focus when tabbing before first focusable`, async ({ puppeteer: { page, tab } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick();
  })

  await page.keyboard.down('Shift')
  await tab({ direction: 'backward', total: 1 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'last focusable')
})

suite(`contains focus when tabbing past last focusable`, async ({ puppeteer: { page, tab } }) => {
  await page.goto('http://localhost:5173/useModal/withoutOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    window.testState.modal.dialog.open();
    await window.nextTick();
  })

  // Tab past the first focusable and the button to open stacked modal
  // and the last focusable, back to the first focusable.
  await tab({ direction: 'forward', total: 3 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'first focusable')
})

suite.run()
