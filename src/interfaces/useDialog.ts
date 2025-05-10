import {
  type ElementApi,
  type LabelMeta,
  type SupportedElement,
} from '../extracted'
import { useSemantic } from './useSemantic'

export type Dialog = {
  root: ElementApi<SupportedElement, true, LabelMeta>,
}

export type UseDialogOptions = {
  alerts?: boolean,
}

const defaultOptions: UseDialogOptions = {
  alerts: false,
}

export function useDialog (options: UseDialogOptions = {}): Dialog {
  // OPTIONS
  const {
    alerts,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const { root }: Pick<Dialog, 'root'> = useSemantic({
    role: alerts ? 'alertdialog' : 'dialog',
  })


  // API
  return {
    root,
  }
}
