import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toInputEffectNames } from '../../src/extracted/toInputEffectNames'

const suite = createSuite('useTextbox.toInputEffectNames')

suite(`records previous and new when string is replaced and current string is not recorded`, () => {
  const value = toInputEffectNames({
          currentString: 'abc',
          newString: 'abcde',
          lastRecordedString: '',
          newSelection: { start: 0, end: 0, direction: 'none' },
          currentSelection: { start: 0, end: 0, direction: 'none' },
        }),
        expected = ['recordPrevious', 'recordNew']

  assert.equal(value, expected)
})

suite(`records new when string is replaced and current string is recorded`, () => {
  const value = toInputEffectNames({
          currentString: '',
          newString: 'aa',
          lastRecordedString: '',
          newSelection: { start: 0, end: 0, direction: 'none' },
          currentSelection: { start: 0, end: 0, direction: 'none' },
        }),
        expected = ['recordNew']

  assert.equal(value, expected)
})

suite(`records none when single character is added and current string is recorded`, () => {
  const value = toInputEffectNames({
          currentString: 'abc',
          newString: 'abcd',
          lastRecordedString: 'abc',
          newSelection: { start: 0, end: 0, direction: 'none' },
          currentSelection: { start: 0, end: 0, direction: 'none' },
        }),
        expected = ['recordNone']

  assert.equal(value, expected)
})


suite.run()
