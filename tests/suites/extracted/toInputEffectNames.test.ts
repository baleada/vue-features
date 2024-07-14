import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { toInputEffectNames } from '../../../src/extracted/toInputEffectNames'

const suite = createSuite('useTextbox.toInputEffectNames')

// REPLACING
suite('records previous and new when string is replaced and previous string is not recorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'bcd',
          lastRecordedString: '',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'bcd'.length,
            end: 'bcd'.length,
            direction: 'none',
          },
        }),
        expected = ['recordPrevious', 'recordNew']

  assert.equal(value, expected)
})

suite('records new when string is replaced and previous string is recorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'bcd',
          lastRecordedString: 'abc',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'bcd'.length,
            end: 'bcd'.length,
            direction: 'none',
          },
        }),
        expected = ['recordNew']

  assert.equal(value, expected)
})


// ADDING
suite('syncs when single non-whitespace is added and previous string is recorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'abcd',
          lastRecordedString: 'abc',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abcd'.length,
            end: 'abcd'.length,
            direction: 'none',
          },
        }),
        expected = ['sync']

  assert.equal(value, expected)
})

suite('records previous and new when single non-whitespace is added after a sequence of unrecorded removals', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'abcd',
          lastRecordedString: 'abcde',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abcd'.length,
            end: 'abcd'.length,
            direction: 'none',
          },
        }),
        expected = ['recordPrevious', 'recordNew']

  assert.equal(value, expected)
})

suite('syncs when single non-whitespace is added after a sequence of unrecorded additions', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'abcd',
          lastRecordedString: 'a',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abcd'.length,
            end: 'abcd'.length,
            direction: 'none',
          },
        }),
        expected = ['sync']

  assert.equal(value, expected)
})

suite('records new when single whitespace is added and previous string is recorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'abc ',
          lastRecordedString: 'abc',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abc '.length,
            end: 'abc '.length,
            direction: 'none',
          },
        }),
        expected = ['recordNew']

  assert.equal(value, expected)
})

suite('records previous and new when single whitespace is added and previous string is unrecorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'abc ',
          lastRecordedString: '',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abc '.length,
            end: 'abc '.length,
            direction: 'none',
          },
        }),
        expected = ['recordPrevious', 'recordNew']

  assert.equal(value, expected)
})

suite('records new when multiple characters are added and previous string is recorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'abcde',
          lastRecordedString: 'abc',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abcde'.length,
            end: 'abcde'.length,
            direction: 'none',
          },
        }),
        expected = ['recordNew']

  assert.equal(value, expected)
})

suite('records previous and new when multiple characters are added and previous string is unrecorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'abcde',
          lastRecordedString: '',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abcde'.length,
            end: 'abcde'.length,
            direction: 'none',
          },
        }),
        expected = ['recordPrevious', 'recordNew']

  assert.equal(value, expected)
})


// REMOVING
suite('syncs when single non-whitespace is removed and previous string is recorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'ab',
          lastRecordedString: 'abc',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'ab'.length,
            end: 'ab'.length,
            direction: 'none',
          },
        }),
        expected = ['sync']

  assert.equal(value, expected)
})

suite('syncs when single non-whitespace is removed after a sequence of unrecorded removals', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'ab',
          lastRecordedString: 'abcde',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'ab'.length,
            end: 'ab'.length,
            direction: 'none',
          },
        }),
        expected = ['sync']

  assert.equal(value, expected)
})

suite('records previous and syncs when single non-whitespace is removed after a sequence of unrecorded additions', () => {
  const value = toInputEffectNames({
          previousString: 'abc',
          newString: 'ab',
          lastRecordedString: 'a',
          previousSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'ab'.length,
            end: 'ab'.length,
            direction: 'none',
          },
        }),
        expected = ['recordPrevious', 'sync']

  assert.equal(value, expected)
})

suite('records new when single whitespace is removed and previous string is recorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc ',
          newString: 'abc',
          lastRecordedString: 'abc ',
          previousSelection: {
            start: 'abc '.length,
            end: 'abc '.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
        }),
        expected = ['recordNew']

  assert.equal(value, expected)
})

suite('records previous and new when single whitespace is removed and previous string is unrecorded', () => {
  const value = toInputEffectNames({
          previousString: 'abc ',
          newString: 'abc',
          lastRecordedString: 'abc d',
          previousSelection: {
            start: 'abc '.length,
            end: 'abc '.length,
            direction: 'none',
          },
          newSelection: {
            start: 'abc'.length,
            end: 'abc'.length,
            direction: 'none',
          },
        }),
        expected = ['recordPrevious', 'recordNew']

  assert.equal(value, expected)
})

suite('records new when multiple characters are removed and previous string is recorded', () => {
  const value = toInputEffectNames({
          previousString: 'abcd',
          newString: 'ab',
          lastRecordedString: 'abcd',
          previousSelection: {
            start: 'abcd'.length,
            end: 'abcd'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'ab'.length,
            end: 'ab'.length,
            direction: 'none',
          },
        }),
        expected = ['recordNew']

  assert.equal(value, expected)
})

suite('records previous and new when multiple characters are removed and previous string is unrecorded', () => {
  const value = toInputEffectNames({
          previousString: 'abcd',
          newString: 'ab',
          lastRecordedString: 'a',
          previousSelection: {
            start: 'abcd'.length,
            end: 'abcd'.length,
            direction: 'none',
          },
          newSelection: {
            start: 'ab'.length,
            end: 'ab'.length,
            direction: 'none',
          },
        }),
        expected = ['recordPrevious', 'recordNew']

  assert.equal(value, expected)
})

suite.run()
