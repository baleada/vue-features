import { bind } from '../affordances'
import {
  useElementApi,
  toLabelBindValues,
  defaultLabelMeta,
  type ElementApi,
  type LabelMeta,
  type SupportedElement,
} from '../extracted'

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
  const root: Dialog['root'] = useElementApi({
    identifies: true,
    defaultMeta: defaultLabelMeta,
  })


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: alerts ? 'alertdialog' : 'dialog',
      ...toLabelBindValues(root),
    }
  )


  // API
  return {
    root,
  }
}
