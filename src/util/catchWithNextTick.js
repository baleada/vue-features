import { nextTick } from 'vue'

// Certain function refs take an additional tick to register their DOM element.
// Catching errors with nextTick helps in those cases.
export default function catchWithNextTick (functionInvolvingDomTarget) {
  try {
    functionInvolvingDomTarget()
  } catch (error) {
    nextTick(() => functionInvolvingDomTarget())
  }
}
