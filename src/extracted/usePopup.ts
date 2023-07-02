import { ref } from 'vue'
import type { Ref } from 'vue'

export type Popup = {
  status: Ref<'opened' | 'closed'>,
  open: () => void,
  close: () => void,
  is: {
    opened: () => boolean,
    closed: () => boolean,
  }
}

export type UsePopupOptions = {
  initialStatus?: 'opened' | 'closed',
}

const defaultOptions: UsePopupOptions = {
  initialStatus: 'closed',
}

export function usePopup (options: UsePopupOptions = {}): Popup {
  // OPTIONS
  const {
    initialStatus,
  } = { ...defaultOptions, ...options }

  
  // STATUS
  const status = ref(initialStatus)

  
  // API
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
    },
  }  
}
