import { isRef } from 'vue'
import type { WatchSource } from 'vue'
import { ensureWatchSources } from './ensureWatchSources'
import type { StatusOption } from './ensureGetStatus'

export function ensureWatchSourcesFromStatus<Status extends string> (status: StatusOption<Status>): WatchSource[] {
  if (typeof status === 'function') {
    return []
  }
  
  return ensureWatchSources(status.watchSource)
}
