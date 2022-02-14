import { ref } from 'vue'
import type { Ref } from 'vue'

export type PopupTracking = {
  status: Ref<'opened' | 'closed'>,
  open: () => void,
  close: () => void,
  is: {
    opened: () => boolean,
    closed: () => boolean,
  }
}

export type UsePopupTrackingOptions = {
  initialStatus?: 'opened' | 'closed',
}

const defaultOptions: UsePopupTrackingOptions = {
  initialStatus: 'closed',
}

export function usePopupTracking (options: UsePopupTrackingOptions = {}): PopupTracking {
  // OPTIONS
  const {
    initialStatus,
  } = { ...defaultOptions, ...options }

  
  // STATUS
  const status = ref(initialStatus)

  return {
    status,
    open: () => {
      status.value = 'opened'
    },
    close: () => {
      status.value = 'closed'
    },
    is: {
      opened: () => status.value === 'opened',
      closed: () => status.value === 'closed',
    }
  }  
}
