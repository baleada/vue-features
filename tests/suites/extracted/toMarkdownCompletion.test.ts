import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  toSymmetricalCompletion,
  toMappedCompletion,
  toOpeningAndClosingCompletion,
} from '../../../src/extracted/toMarkdownCompletion'

const suite = createSuite('toMarkdownCompletion')

suite(`toggles symmetrical`, () => {
  (() => {
    const value = toSymmetricalCompletion({ punctuation: '**', segment: 'Baleada' }),
          expected = '**Baleada**'
    
    assert.is(value, expected)
  })();
  
  (() => {
    const value = toSymmetricalCompletion({ punctuation: '**', segment: '**Baleada**' }),
          expected = 'Baleada'
    
    assert.is(value, expected)
  })();
})

suite(`toggles mapped`, () => {
  (() => {
    const value = toMappedCompletion({ punctuation: '> ', segment: 'Baleada:\na toolkit\nfor building web apps' }),
          expected = '> Baleada:\n> a toolkit\n> for building web apps'
    
    assert.is(value, expected)
  })();
  
  (() => {
    const value = toMappedCompletion({ punctuation: '> ', segment: '> Baleada:\n> a toolkit\n> for building web apps' }),
          expected = 'Baleada:\na toolkit\nfor building web apps'
    
    assert.is(value, expected)
  })();
})

suite(`toggles opening and closing`, () => {
  (() => {
    const value = toOpeningAndClosingCompletion({ opening: '```\n', closing: '\n```', segment: 'Baleada:\na toolkit\nfor building web apps' }),
          expected = '```\nBaleada:\na toolkit\nfor building web apps\n```'
    
    assert.is(value, expected)
  })();
  
  (() => {
    const value = toOpeningAndClosingCompletion({ opening: '```\n', closing: '\n```', segment: '```\nBaleada:\na toolkit\nfor building web apps\n```' }),
          expected = 'Baleada:\na toolkit\nfor building web apps'
    
    assert.is(value, expected)
  })();
})

suite.run()
