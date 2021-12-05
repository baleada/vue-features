import { isRef } from 'vue'
import type { WatchSource } from 'vue'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import { ensureWatchSources } from './ensureWatchSources'

export function ensureWatchSourcesFromStatus<Status extends string> (status: BindValue<Status> | BindValueGetterWithWatchSources<Status>): WatchSource[] {
  if (typeof status === 'string' || typeof status === 'function') {
    return []
  }
  
  if (isRef(status)) {
    return [status]
  }
  
  return ensureWatchSources(status.watchSources)
}
