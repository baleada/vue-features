import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import type { Plane } from './ensureReactivePlane'
import { ensureWatchSources } from './ensureWatchSources'
import type { StatusOption } from './ensureGetStatus'

export function ensureWatchSourcesFromStatus<
  B extends Ref<HTMLElement> | Ref<HTMLElement[]> | Ref<Plane<HTMLElement>>,
  Status extends string
> (status: StatusOption<B, Status>): WatchSource[] {
  if (typeof status === 'function') {
    return []
  }
  
  return ensureWatchSources(status.watchSource)
}
