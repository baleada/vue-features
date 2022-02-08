import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useDialog')
)

suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')

  const dialog = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
    return (window as unknown as WithGlobals).testState.dialog.root.element.value.getAttribute('role')
  })
  
  assert.is(dialog, 'dialog')

  const hasPopup = await page.evaluate(() => {
    return (window as unknown as WithGlobals).testState.dialog.hasPopup.element.value.getAttribute('aria-haspopup')
  })

  assert.is(hasPopup, 'dialog')
})

suite(`alertdialog role is optionally assigned`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useDialog/alert')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
    return (window as unknown as WithGlobals).testState.dialog.root.element.value.getAttribute('role')
  })

  assert.is(value, 'alertdialog')
})

suite(`open() opens dialog`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
    return (window as unknown as WithGlobals).testState.dialog.status.value
  })

  assert.is(value, 'opened')
})

suite(`close() closes dialog`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
    (window as unknown as WithGlobals).testState.dialog.close();
    await (window as unknown as WithGlobals).nextTick();
    return (window as unknown as WithGlobals).testState.dialog.status.value
  })

  assert.is(value, 'closed')
})

suite(`hasPopup interactions open dialog`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')

  const buttonRect: DOMRect = await page.evaluate(() => {
    return JSON.parse(JSON.stringify(document.querySelector('button').getBoundingClientRect()))
  })
  await page.mouse.move(buttonRect.x, buttonRect.y)
  await page.mouse.down()
  await page.mouse.up()
  const mousedown = await page.evaluate(() => (window as unknown as WithGlobals).testState.dialog.status.value)
  assert.is(mousedown, 'opened')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.dialog.close())

  await page.keyboard.press('Enter')
  const enter = await page.evaluate(() => (window as unknown as WithGlobals).testState.dialog.status.value)
  assert.is(enter, 'opened')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.dialog.close())

  await page.keyboard.press('Space')
  const space = await page.evaluate(() => (window as unknown as WithGlobals).testState.dialog.status.value)
  assert.is(space, 'opened')
})

suite(`esc closes dialog`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
  })

  await page.keyboard.press('Escape')

  const value = await page.evaluate(() => {
    return (window as unknown as WithGlobals).testState.dialog.status.value
  })

  assert.is(value, 'closed')
})

suite(`focuses first focusable when opened`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
    await (window as unknown as WithGlobals).nextTick();
    return document.activeElement.textContent
  })

  assert.is(value, 'first focusable')
})

suite(`focuses has popup by default when closed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')
  await page.focus('button')

  const value = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
    (window as unknown as WithGlobals).testState.dialog.close();
    await (window as unknown as WithGlobals).nextTick();
    return document.activeElement.textContent
  })

  assert.is(value, 'has popup')
})

suite(`contains focus when tabbing before first focusable`, async ({ puppeteer: { page, tab } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
  })

  await page.keyboard.down('Shift')
  await tab({ direction: 'backward', total: 1 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'last focusable')
})

suite(`contains focus when tabbing past last focusable`, async ({ puppeteer: { page, tab } }) => {
  await page.goto('http://localhost:3000/useDialog/withoutOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
  })

  // Tab past the first focusable and the button to open stacked dialog
  // and the last focusable, back to the first focusable.
  await tab({ direction: 'forward', total: 3 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'first focusable')
})

suite.run()
