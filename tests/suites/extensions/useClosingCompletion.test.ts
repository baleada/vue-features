import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useClosingCompletion')
)

suite(`keeps text in sync with textbox.text`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada'
          ;(window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          
          return {
            string: (window as unknown as WithGlobals).testState.closingCompletion.segmentedBySelection.value.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.closingCompletion.segmentedBySelection.value.selection)),
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

suite(`records new when previous string is recorded`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.textbox.record({
      string: 'Baleada',
      selection: {
        start: 'Baleada'.length,
        end: 'Baleada'.length,
        direction: 'forward',
      }
    })
    await (window as unknown as WithGlobals).nextTick()
  })

  await page.type('input', '[')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.textbox.history.value.array.length
        }),
        expected = 3

  assert.is(value, expected)
})

suite(`records previous and new when previous string is not recorded`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada'
    ;(window as unknown as WithGlobals).testState.textbox.text.value.selection = {
      start: 'Baleada'.length,
      end: 'Baleada'.length,
      direction: 'forward',
    }
    await (window as unknown as WithGlobals).nextTick()
  })

  await page.type('input', '[')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.textbox.history.value.array.length
        }),
        expected = 3

  assert.is(value, expected)
})

suite(`closes all openings by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input')

  for (const opening of ['[', '(', '{', '<', '"', '\'', '`']) {
    await page.type('input', opening)
    await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
  }

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.textbox.history.value.item.string
        }),
        expected = '[({<"\'``\'">})]'

  assert.is(value, expected)
})

suite(`respects \`only\` option`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useClosingCompletion/withOptions')
  await page.waitForSelector('input')

  for (const opening of ['[', '(', '{', '<', '"', '\'', '`']) {
    await page.type('input', opening)
    await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
  }

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.textbox.history.value.item.string
        }),
        expected = '[]'

  assert.is(value, expected)
})

suite(`close(...) closes opening punctuation`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useClosingCompletion/withoutOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.record({
            string: 'Baleada',
            selection: {
              start: 0,
              end: 'Baleada'.length,
              direction: 'forward',
            }
          })
          
          await (window as unknown as WithGlobals).nextTick()
          
          ;(window as unknown as WithGlobals).testState.closingCompletion.close('[')
          
          await (window as unknown as WithGlobals).nextTick();

          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.value.array.length,
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection))
          }
        }),
        expected = {
          historyLength: 3,
          string: '[Baleada]',
          selection: {
            start: 1,
            end: 1 + 'Baleada'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite.run()
