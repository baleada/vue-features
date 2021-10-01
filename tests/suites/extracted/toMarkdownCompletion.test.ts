import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import {
  toSymmetricalCompletion,
  toMappedCompletion,
  toMirroredCompletion,
  toHeadingCompletion,
  toHorizontalRuleCompletion,
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

suite(`toggles mirrored`, () => {
  (() => {
    const value = toMirroredCompletion({ punctuation: '```\n', segment: 'Baleada:\na toolkit\nfor building web apps' }),
          expected = '```\nBaleada:\na toolkit\nfor building web apps\n```'
    
    assert.is(value, expected)
  })();
  
  (() => {
    const value = toMirroredCompletion({ punctuation: '```\n', segment: '```\nBaleada:\na toolkit\nfor building web apps\n```' }),
          expected = 'Baleada:\na toolkit\nfor building web apps'
    
    assert.is(value, expected)
  })();
})

suite(`toggles heading of same level`, () => {
  (() => {
    const value = toHeadingCompletion({ level: 1, segment: 'Baleada' }),
          expected = '# Baleada'
    
    assert.is(value, expected)
  })();
  
  (() => {
    const value = toHeadingCompletion({ level: 1, segment: '# Baleada' }),
          expected = 'Baleada'
    
    assert.is(value, expected)
  })();
})

suite(`prefers applying new heading of a different level`, () => {
  (() => {
    const value = toHeadingCompletion({ level: 1, segment: 'Baleada' }),
          expected = '# Baleada'
    
    assert.is(value, expected)
  })();
  
  (() => {
    const value = toHeadingCompletion({ level: 3, segment: '# Baleada' }),
          expected = '### Baleada'
    
    assert.is(value, expected)
  })();
})

suite(`only adds newline in front of horizontal rule when the segment is empty`, () => {
  (() => {
    const value = toHorizontalRuleCompletion({ character: '-', segment: 'Baleada' }),
          expected = 'Baleada\n---\n'
    
    assert.is(value, expected)
  })();
  
  (() => {
    const value = toHorizontalRuleCompletion({ character: '-', segment: '' }),
          expected = '---\n'
    
    assert.is(value, expected)
  })();
})


suite.run()
