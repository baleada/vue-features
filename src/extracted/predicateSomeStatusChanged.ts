import { includes, some } from 'lazy-collections'
import { type toPlaneStatus } from './toPlaneStatus'

type ValueOf<T> = T[keyof T]

export const predicateSomeStatusChanged = some<ValueOf<ReturnType<typeof toPlaneStatus>>>(
  value => includes(value)(['shortened', 'lengthened', 'changed']) as boolean
)
