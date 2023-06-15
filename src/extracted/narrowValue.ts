import { WatchSource } from "vue";

export function narrowValue<Value extends any> (watchSource: WatchSource<Value>) {
  return typeof watchSource === 'function' ? watchSource() : watchSource.value
}
