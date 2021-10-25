import { isRef } from 'vue'
import type { WatchSource } from 'vue'
import type { BindValueGetterWithWatchSources } from '../affordances'
import type { BindValue } from './scheduleBind'
import { ensureWatchSources } from './ensureWatchSources'

export function ensureWatchSourcesFromGetStatus<Status extends string> (status: BindValue<Status> | BindValueGetterWithWatchSources<Status>): WatchSource[] {
  if (typeof status === 'string' || isRef(status) || typeof status === 'function') {
    return []
  }

  return ensureWatchSources(status.watchSources)
}
