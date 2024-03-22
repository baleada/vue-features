import type { WatchSource } from 'vue'

export function narrowValue<Value> (watchSource: WatchSource<Value>) {
  return typeof watchSource === 'function' ? watchSource() : watchSource.value
}
