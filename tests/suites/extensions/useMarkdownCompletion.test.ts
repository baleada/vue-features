import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useMarkdownCompletion')
)

// Completion logic is tested more thoroughly with toMarkdownCompletion

suite(`keeps inline and block in sync with textbox.text`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
          
          return {
            inline: {
              string: window.testState.markdownCompletion.segmentedBySpace.string,
              selection: JSON.parse(JSON.stringify(window.testState.markdownCompletion.segmentedBySpace.selection)),
            },
            block: {
              string: window.testState.markdownCompletion.segmentedByNewline.string,
              selection: JSON.parse(JSON.stringify(window.testState.markdownCompletion.segmentedByNewline.selection)),
            },
          }
        }),
        expected = {
          inline: {
            string: 'Baleada',
            selection: {
              start: 'Baleada'.length,
              end: 'Baleada'.length,
              direction: 'forward',
            },
          },
          block: {
            string: 'Baleada',
            selection: {
              start: 'Baleada'.length,
              end: 'Baleada'.length,
              direction: 'forward',
            },
          }
        }

  assert.equal(value, expected)
})

suite(`records new when previous string is recorded`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.record({
            string: 'Baleada',
            selection: {
              start: 'Baleada'.length,
              end: 'Baleada'.length,
              direction: 'forward',
            }
          })
          
          await window.nextTick()
          
          await window.testState.markdownCompletion.bold()
          
          await window.nextTick()

          return window.testState.textbox.history.array.length
        }),
        expected = 3

  assert.is(value, expected)
})

suite(`records previous and new when previous string is not recorded`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
                
          await window.testState.markdownCompletion.bold()
          
          await window.nextTick()

          return window.testState.textbox.history.array.length
        }),
        expected = 3

  assert.is(value, expected)
})

// bold
// italic
// superscript
// subscript
// strikethrough
// code
suite(`handles symmetrical markdown, selecting completion by default`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
                
          await window.testState.markdownCompletion.bold()
          
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: '**Baleada**',
          selection: {
            start: 0,
            end: '**Baleada**'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

// blockquote
// orderedList
// unorderedList
suite(`handles mapped markdown, selecting completion by default`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada:\na toolkit\nfor building web apps'
          window.testState.textbox.text.selection = {
            start: 0,
            end: 'Baleada:\na toolkit\nfor building web apps'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
                
          await window.testState.markdownCompletion.blockquote()
          
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: '> Baleada:\n> a toolkit\n> for building web apps',
          selection: {
            start: 0,
            end: '> Baleada:\n> a toolkit\n> for building web apps'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

// codeblock
suite(`handles mirrored markdown, selecting completion by default`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada:\na toolkit\nfor building web apps'
          window.testState.textbox.text.selection = {
            start: 0,
            end: 'Baleada:\na toolkit\nfor building web apps'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
                
          await window.testState.markdownCompletion.codeblock()
          
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: '```\nBaleada:\na toolkit\nfor building web apps\n```',
          selection: {
            start: 0,
            end: '```\nBaleada:\na toolkit\nfor building web apps\n```'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite(`handles heading markdown, selecting completion by default`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
          await window.testState.markdownCompletion.heading()
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: '# Baleada',
          selection: {
            start: 0,
            end: '# Baleada'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite(`link(...) selects href (between parentheses) by default`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
          await window.testState.markdownCompletion.link()
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: '[Baleada]()',
          selection: {
            start: '[Baleada]('.length,
            end: '[Baleada]('.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite(`horizontalRule(...) uses '-' character by default`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
          await window.testState.markdownCompletion.horizontalRule()
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: 'Baleada\n---\n',
          selection: {
            start: 0,
            end: 'Baleada\n---\n'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite(`horizontalRule(...) respects character option`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
          await window.testState.markdownCompletion.horizontalRule({ character: '*' })
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: 'Baleada\n***\n',
          selection: {
            start: 0,
            end: 'Baleada\n***\n'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite(`unorderedList(...) uses '-' bullet by default`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
          await window.testState.markdownCompletion.unorderedList()
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: '- Baleada',
          selection: {
            start: 0,
            end: '- Baleada'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite(`unorderedList(...) respects bullet option`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
          await window.testState.markdownCompletion.unorderedList({ bullet: '*' })
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: '* Baleada',
          selection: {
            start: 0,
            end: '* Baleada'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite(`heading(...) respects level option`, async ({ playwright: { page } }) => {
  await page.goto('http:/localhost:5173/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.textbox.text.string = 'Baleada'
          window.testState.textbox.text.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await window.nextTick()
          await window.testState.markdownCompletion.heading({ level: 3 })
          await window.nextTick()

          return {
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection)),
          }
        }),
        expected = {
          string: '### Baleada',
          selection: {
            start: 0,
            end: '### Baleada'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

suite.run()
