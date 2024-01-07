import { createKeycomboMatch } from '@baleada/logic'

export const predicateUp = createKeycomboMatch('up')
export const predicateRight = createKeycomboMatch('right')
export const predicateDown = createKeycomboMatch('down')
export const predicateLeft = createKeycomboMatch('left')
export const predicateArrow: ReturnType<typeof createKeycomboMatch> = event => (
  predicateUp(event)
  || predicateRight(event)
  || predicateDown(event)
  || predicateLeft(event)
)

export const predicateAlt = createKeycomboMatch('alt')
export const predicateCmd = createKeycomboMatch('cmd')
export const predicateCtrl = createKeycomboMatch('ctrl')
export const predicateShift = createKeycomboMatch('shift')

export const predicateBackspace = createKeycomboMatch('backspace')
export const predicateEnter = createKeycomboMatch('enter')
export const predicateEsc = createKeycomboMatch('esc')
export const predicateTab = createKeycomboMatch('tab')
export const predicateHome = createKeycomboMatch('home')
export const predicateEnd = createKeycomboMatch('end')
export const predicateSpace = createKeycomboMatch('space')
