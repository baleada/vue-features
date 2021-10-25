import { isRef } from 'vue'
import type { WatchSource } from 'vue'
import type { BindValueGetterObject } from '../affordances'
import type { BindValue } from './scheduleBind'
import { ensureWatchSources } from './ensureWatchSources'

export function ensureWatchSourcesFromGetStatus<Status extends string> (getStatus: BindValue<Status> | BindValueGetterObject<Status>): WatchSource[] {
  if (typeof getStatus === 'string' || isRef(getStatus) || typeof getStatus === 'function') {
    return []
  }

  return ensureWatchSources(getStatus.watchSources)
}
