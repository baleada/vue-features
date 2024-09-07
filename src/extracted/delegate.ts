import { delegateHover } from './delegateHover'
import { delegatePress } from './delegatePress'

export function delegate () {
  return {
    hover: delegateHover(),
    press: delegatePress(),
  }
}
