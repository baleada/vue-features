import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useClosingCompletion')
)

suite('keeps text in sync with textbox.text', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }

          await window.nextTick()

          return {
            string: window.testState.closingCompletion.segmentedBySelection.string,
            selection: JSON.parse(JSON.stringify(window.testState.closingCompletion.segmentedBySelection.selection)),
          }
        }),
        expected = {
          string: 'Baleada',
          selection: {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          },
        }

  assert.equal(value, expected)
})

suite('records new when previous string is recorded', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })
  const locator = page.locator('input')

  await page.evaluate(async () => {
    window.testState.textbox.record({
      string: 'Baleada',
      selection: {
        start: 'Baleada'.length,
        end: 'Baleada'.length,
        direction: 'forward',
      },
    })
    await window.nextTick()
  })

  await locator.pressSequentially('[')

  const value = await page.evaluate(() => {
          return window.testState.textbox.history.array.length
        }),
        expected = 3

  assert.is(value, expected)
})

suite('records previous and new when previous string is not recorded', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })
  const locator = page.locator('input')

  await page.evaluate(async () => {
    window.testState.textbox.text.string = 'Baleada'
    window.testState.textbox.text.selection = {
      start: 'Baleada'.length,
      end: 'Baleada'.length,
      direction: 'forward',
    }
    await window.nextTick()
  })

  await locator.pressSequentially('[')

  const value = await page.evaluate(() => {
          return window.testState.textbox.history.array.length
        }),
        expected = 3

  assert.is(value, expected)
})

suite('closes all openings by default', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })
  const locator = page.locator('input')

  for (const { shift, text } of [
    { shift: false, text: '[' },
    { shift: true, text: '9' },
    { shift: true, text: '[' },
    { shift: true, text: ',' },
    { shift: true, text: '"' },
    { shift: false, text: '\'' },
    { shift: false, text: '`' },
  ]) {
    if (shift) await page.keyboard.down('Shift')
    await locator.pressSequentially(text)
    if (shift) await page.keyboard.up('Shift')
    await page.evaluate(async () => await window.nextTick())
  }

  const value = await page.evaluate(() => {
          return window.testState.textbox.history.item.string
        }),
        expected = '[({<"\'``\'">})]'

  assert.is(value, expected)
})

console.warn('`only` option flaking in automated tests')
suite.skip('respects `only` option', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useClosingCompletion/withOptions')
  await page.waitForSelector('input', { state: 'attached' })
  const locator = page.locator('input')

  for (const { shift, text } of [
    { shift: false, text: '[' },
    { shift: true, text: '9' },
    { shift: true, text: '[' },
    { shift: true, text: ',' },
    { shift: true, text: '"' },
    { shift: false, text: '\'' },
    { shift: false, text: '`' },
  ]) {
    if (shift) await page.keyboard.down('Shift')
    await locator.pressSequentially(text)
    if (shift) await page.keyboard.up('Shift')
    await page.evaluate(async () => await window.nextTick())
  }

  const value = await page.evaluate(() => {
          return window.testState.textbox.history.item.string
        }),
        expected = '[({<"\'`]'

  assert.is(value, expected)
})

suite('close(...) closes opening punctuation', async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.record({
            string: 'Baleada',
            selection: {
              start: 0,
              end: 'Baleada'.length,
              direction: 'forward',
            },
          })

          await window.nextTick()

          window.testState.closingCompletion.close('[')

          await window.nextTick()

          return {
            historyLength: window.testState.textbox.history.array.length,
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          historyLength: 3,
          string: '[Baleada]',
          selection: {
            start: 1,
            end: 1 + 'Baleada'.length,
            direction: 'forward',
          },
        }

  assert.equal(value, expected)
})

suite.run()
