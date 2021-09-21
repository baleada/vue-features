import type { Completeable } from '@baleada/logic'

export function toInputEffectNames (
  {
    previousString,
    newString,
    lastRecordedString,
    previousSelection,
    newSelection,
  }: {
    newString: string,
    previousString: string,
    lastRecordedString: string,
    previousSelection: Completeable['selection'],
    newSelection: Completeable['selection'],
  }
): ('recordNone' | 'nextTickRecordNone' | 'recordNew' | 'recordPrevious')[] {
  const change: {
    operation: 'add' | 'remove' | 'replace',
    quantity: 'single' | 'multiple',
    previousStatus: 'recorded' | 'unrecorded',
    newLastCharacter: 'whitespace' | 'not whitespace',
    previousLastCharacter: 'whitespace' | 'not whitespace',
  } = {
    operation:
      (newString.length - previousString.length > 0 && 'add')
      || (newString.length - previousString.length < 0 && 'remove')
      || 'replace',
    quantity: Math.abs(newString.length - previousString.length) > 1 ? 'multiple': 'single',
    previousStatus: lastRecordedString === previousString ? 'recorded': 'unrecorded',
    newLastCharacter: /\s/.test(newString[newSelection.start - 1]) ? 'whitespace' : 'not whitespace',
    previousLastCharacter: /\s/.test(previousString[previousSelection.start - 1]) ? 'whitespace' : 'not whitespace',
  }

  if (
    change.operation === 'replace'
    && change.previousStatus === 'recorded'
  ) {
    return ['recordNew']
  }
  if (
    change.operation === 'replace'
    && change.previousStatus === 'unrecorded'
  ) {
    return ['recordPrevious', 'recordNew']
  }

  // Adding
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'not whitespace' &&
    change.previousStatus === 'recorded'
  ) {
    return ['recordNone']
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'not whitespace' &&
    change.previousStatus === 'unrecorded'
  ) {
    // First addition after a sequence of unrecorded removals
    if (lastRecordedString.length > previousString.length) {
      return ['recordPrevious', 'recordNew']
    }

    return ['recordNone']
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'whitespace' &&
    change.previousStatus === 'recorded'
  ) {
    return ['recordNew']
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'whitespace' &&
    change.previousStatus === 'unrecorded'
  ) {
    return ['recordPrevious', 'recordNew']
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'multiple' &&
    change.previousStatus === 'recorded'
  ) {
    return ['recordNew']
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'multiple' &&
    change.previousStatus === 'unrecorded'
  ) {
    return ['recordPrevious', 'recordNew']
  }
  
  // Remove
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'not whitespace' &&
    change.previousStatus === 'recorded'
  ) {
    return ['recordNone']
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'not whitespace' &&
    change.previousStatus === 'unrecorded'
  ) {
    // Continuing unrecorded removals
    if (lastRecordedString.length > previousString.length) {
      return ['recordNone']
    }
    
    return ['recordPrevious', 'nextTickRecordNone']
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'whitespace' &&
    change.previousStatus === 'recorded'
  ) {
    return ['recordNew']
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'whitespace' &&
    change.previousStatus === 'unrecorded'
  ) {
    return ['recordPrevious', 'recordNew']
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'multiple' &&
    change.previousStatus === 'recorded'
  ) {
    return ['recordNew']
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'multiple' &&
    change.previousStatus === 'unrecorded'
  ) {
    return ['recordPrevious', 'recordNew']
  }
}
