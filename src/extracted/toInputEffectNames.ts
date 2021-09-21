import type { Completeable } from '@baleada/logic'

export function toInputEffectNames (
  {
    newString,
    currentString,
    lastRecordedString,
    newSelection,
    currentSelection,
  }: {
    newString: string,
    currentString: string,
    lastRecordedString: string,
    newSelection: Completeable['selection'],
    currentSelection: Completeable['selection'],
  }
): ('recordNone' | 'nextTickRecordNone' | 'recordNew' | 'recordPrevious')[] {
  const change: {
    operation: 'add' | 'remove' | 'replace',
    quantity: 'single' | 'multiple',
    previousStatus: 'recorded' | 'unrecorded',
    newLastCharacter: 'whitespace' | 'character',
    previousLastCharacter: 'whitespace' | 'character',
  } = {
    operation:
      (newString.length - currentString.length > 0 && 'add')
      || (newString.length - currentString.length < 0 && 'remove')
      || 'replace',
    quantity: Math.abs(newString.length - currentString.length) > 1 ? 'multiple': 'single',
    previousStatus: lastRecordedString === currentString ? 'recorded': 'unrecorded',
    newLastCharacter: /\s/.test(newString[newSelection.start - 1]) ? 'whitespace' : 'character',
    previousLastCharacter: /\s/.test(currentString[currentSelection.start - 1]) ? 'whitespace' : 'character',
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
    change.newLastCharacter === 'character' &&
    change.previousStatus === 'recorded'
  ) {
    return ['recordNone']
  }
  if (
    change.operation === 'add' &&
    change.quantity === 'single' &&
    change.newLastCharacter === 'character' &&
    change.previousStatus === 'unrecorded'
  ) {
    // First addition after a sequence of unrecorded removals
    if (lastRecordedString.length > currentString.length) {
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
    change.previousLastCharacter === 'character' &&
    change.previousStatus === 'recorded'
  ) {
    return ['recordNone']
  }
  if (
    change.operation === 'remove' &&
    change.quantity === 'single' &&
    change.previousLastCharacter === 'character' &&
    change.previousStatus === 'unrecorded'
  ) {
    // Continuing unrecorded removals
    if (lastRecordedString.length > currentString.length) {
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
