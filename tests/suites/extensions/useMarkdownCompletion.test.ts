import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useMarkdownCompletion')
)

// Completion logic is tested more thoroughly with toMarkdownCompletion

suite(`keeps inline and block in sync with textbox.text`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          
          return {
            inline: {
              string: (window as unknown as WithGlobals).testState.markdownCompletion.segmentedBySpace.value.string,
              selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.markdownCompletion.segmentedBySpace.value.selection)),
            },
            block: {
              string: (window as unknown as WithGlobals).testState.markdownCompletion.segmentedByNewline.value.string,
              selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.markdownCompletion.segmentedByNewline.value.selection)),
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

suite(`records new when previous string is recorded`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.record({
            string: 'Baleada',
            selection: {
              start: 'Baleada'.length,
              end: 'Baleada'.length,
              direction: 'forward',
            }
          })
          
          await (window as unknown as WithGlobals).nextTick()
          
          await (window as unknown as WithGlobals).testState.markdownCompletion.bold()
          
          await (window as unknown as WithGlobals).nextTick()

          return (window as unknown as WithGlobals).testState.textbox.history.value.array.length
        }),
        expected = 3

  assert.is(value, expected)
})

suite(`records previous and new when previous string is not recorded`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
                
          await (window as unknown as WithGlobals).testState.markdownCompletion.bold()
          
          await (window as unknown as WithGlobals).nextTick()

          return (window as unknown as WithGlobals).testState.textbox.history.value.array.length
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
suite(`handles symmetrical markdown, selecting completion by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
                
          await (window as unknown as WithGlobals).testState.markdownCompletion.bold()
          
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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
suite(`handles mapped markdown, selecting completion by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada:\na toolkit\nfor building web apps';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 0,
            end: 'Baleada:\na toolkit\nfor building web apps'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
                
          await (window as unknown as WithGlobals).testState.markdownCompletion.blockquote()
          
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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
suite(`handles mirrored markdown, selecting completion by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada:\na toolkit\nfor building web apps';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 0,
            end: 'Baleada:\na toolkit\nfor building web apps'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
                
          await (window as unknown as WithGlobals).testState.markdownCompletion.codeblock()
          
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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

suite(`handles heading markdown, selecting completion by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          await (window as unknown as WithGlobals).testState.markdownCompletion.heading()
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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

suite(`link(...) selects href (between parentheses) by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          await (window as unknown as WithGlobals).testState.markdownCompletion.link()
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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

suite(`horizontalRule(...) uses '-' character by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          await (window as unknown as WithGlobals).testState.markdownCompletion.horizontalRule()
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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

suite(`horizontalRule(...) respects character option`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          await (window as unknown as WithGlobals).testState.markdownCompletion.horizontalRule({ character: '*' })
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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

suite(`unorderedList(...) uses '-' bullet by default`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          await (window as unknown as WithGlobals).testState.markdownCompletion.unorderedList()
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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

suite(`unorderedList(...) respects bullet option`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          await (window as unknown as WithGlobals).testState.markdownCompletion.unorderedList({ bullet: '*' })
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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

suite(`heading(...) respects level option`, async ({ puppeteer: { page } }) => {
  await page.goto('http:/localhost:3000/useMarkdownCompletion/withoutOptions')
  await page.waitForSelector('textarea')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.value.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.text.value.selection = {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          }
          
          await (window as unknown as WithGlobals).nextTick()
          await (window as unknown as WithGlobals).testState.markdownCompletion.heading({ level: 3 })
          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection)),
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
