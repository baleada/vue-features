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

  const value = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.dialog.open();
    await (window as unknown as WithGlobals).nextTick();
    return (window as unknown as WithGlobals).testState.dialog.root.element.value.getAttribute('role')
  })

  assert.is(value, 'dialog')
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
    return document.activeElement.textContent
  })

  assert.is(value, 'first focusable')
})

suite(`focuses previously focused when closed`, async ({ puppeteer: { page } }) => {
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

  assert.is(value, 'previously focused')
})

suite(`contains focus when last focusable blurs`, async ({ puppeteer: { page, tab } }) => {
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
