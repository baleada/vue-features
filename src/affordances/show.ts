import type { Ref } from 'vue'
import { some } from 'lazy-collections'
import { Listenable } from '@baleada/logic'
import { onRenderedBind, toRenderedKind, toComputedStyle } from '../extracted'
import type {
  BindElement,
  BindValue,
  Plane,
  RenderedKind,
  Coordinates,
  SupportedElement,
} from '../extracted'
import { narrowBindValue, narrowWatchSourceOrSources } from './bind'
import type { BindReactiveValueGetter } from './bind'

export type ShowOptions<B extends BindElement> = {
  transition?: TransitionOption<B>
}

export type TransitionOption<B extends BindElement> = {
  appear?: TransitionCss | TransitionJs<B> | true,
  enter?: TransitionCss | TransitionJs<B>,
  leave?: TransitionCss | TransitionJs<B>,
}

export type TransitionCss = {
  start?: () => void,
  from: string,
  active: string,
  to: string,
  end?: () => void,
  cancel?: () => void,
}

export type TransitionJs<B extends BindElement> = {
  before?: B extends SupportedElement | Ref<SupportedElement>
    ? () => any
    : B extends SupportedElement[] | Ref<SupportedElement[]>
      ? (index: number) => any
      : (coordinates: Coordinates) => any,
  active?: B extends SupportedElement | Ref<SupportedElement>
    ? (done: () => void) => any
    : B extends SupportedElement[] | Ref<SupportedElement[]>
      ? (index: number, done: () => void) => any
      : (coordinates: Coordinates, done: () => void) => any,
  after?: B extends SupportedElement | Ref<SupportedElement>
    ? () => any
    : B extends SupportedElement[] | Ref<SupportedElement[]>
      ? (index: number) => any
      : (coordinates: Coordinates) => any,
  cancel?: B extends SupportedElement | Ref<SupportedElement>
    ? () => any
    : B extends SupportedElement[] | Ref<SupportedElement[]>
      ? (index: number) => any
      : (coordinates: Coordinates) => any,
}

export function show<B extends BindElement> (
  elementOrListOrPlane: B,
  condition: BindValue<B, boolean> | BindReactiveValueGetter<B, boolean>,
  options: ShowOptions<B> = {},
) {
  const originalStyles = new WeakMap<
          SupportedElement,
          {
            display: string,
            // transitionProperty: string,
            // transitionDuration: string,
            // transitionTimingFunction: string,
            // transitionDelay: string,
          }
        >(),
        cancels = new WeakMap<SupportedElement, undefined | (() => boolean)>(),
        statuses = new WeakMap<SupportedElement, 'appeared'>(),
        { transition = {} } = options,
        affordanceElementKind = toRenderedKind(elementOrListOrPlane),
        { appear = {}, enter = {}, leave = {} } = transition,
        transitionTypes = toTransitionTypes({ appear, enter, leave })

  onRenderedBind<B, boolean>(
    elementOrListOrPlane,
    (element, value, row, column) => {
      const didCancel = cancels.get(element)?.()

      if (!originalStyles.get(element)) {
        originalStyles.set(element, {
          display: null,
          // transitionProperty: style.transitionProperty,
          // transitionDuration: style.transitionDuration,
          // transitionTimingFunction: style.transitionTimingFunction,
          // transitionDelay: style.transitionDelay,
        })
      }

      const originalStyle = originalStyles.get(element)

      if (didCancel) {
        cancels.set(element, undefined)

        if (value) {
          // Transition canceled, element should be shown
          if ((element as SupportedElement).style.display === originalStyle.display) {
            return
          }

          (element as SupportedElement).style.display = originalStyle.display
          return
        }

        // Transition canceled, element should not be shown
        (element as SupportedElement).style.display = 'none'
        return
      }

      // Leave
      if (!value) {
        if ((element as SupportedElement).style.display === 'none') {
          return
        }

        if (statuses.get(element) !== 'appeared') {
          (element as SupportedElement).style.display = 'none'
          return
        }

        if (transitionTypes.leave === 'none') {
          (element as SupportedElement).style.display = 'none'
          return
        }

        if (transitionTypes.leave === 'css') {
          const cancel = transitionCss(element, {
            ...(leave as TransitionCss),
            start: addFrom => {
              ;(leave as TransitionCss).start?.()
              addFrom()
            },
            end: removeTo => {
              ;(element as SupportedElement).style.display = 'none'
              removeTo()
              ;(leave as TransitionCss).end?.()
            },
            cancel: () => {
              ;(leave as TransitionCss).cancel?.()
            },
          })

          cancels.set(element, cancel)
          return
        }

        if (transitionTypes.leave === 'js') {
          const cancel = transitionJs(
            affordanceElementKind,
            {
              column,
              row,
              before: (leave as TransitionJs<B>).before,
              start: () => {},
              active: (leave as TransitionJs<B>).active,
              end: status => {
                if (status === 'canceled') {
                  return
                }

                (element as SupportedElement).style.display = 'none'
              },
              after: (leave as TransitionJs<B>).after,
              cancel: (leave as TransitionJs<B>).cancel,
            } as TransitionJsConfig<typeof affordanceElementKind>
          )

          cancels.set(element, cancel)
          return
        }

      }

      if (value) {
        // Set up for enter or appear-as-enter
        function enterEffect () {
          if ((element as SupportedElement).style.display === originalStyle.display) {
            return
          }

          if (transitionTypes.enter === 'none') {
            (element as SupportedElement).style.display = originalStyle.display
            return
          }

          if (transitionTypes.enter === 'css') {
            const cancel = transitionCss(element, {
              ...(enter as TransitionCss),
              start: addFrom => {
                ;(enter as TransitionCss).start?.()
                addFrom()
                ;(element as SupportedElement).style.display = originalStyle.display
              },
              end: removeTo => {
                removeTo()
                ;(enter as TransitionCss).end?.()
              },
              cancel: () => {
                ;(enter as TransitionCss).cancel?.()
              },
            })

            cancels.set(element, cancel)
            return
          }

          if (transitionTypes.enter === 'js') {
            const cancel = transitionJs(
              affordanceElementKind,
              {
                row,
                column,
                before: (enter as TransitionJs<B>).before,
                start: () => ((element as SupportedElement).style.display = originalStyle.display),
                active: (enter as TransitionJs<B>).active,
                end: () => {},
                after: (enter as TransitionJs<B>).after,
                cancel: (enter as TransitionJs<B>).cancel,
              } as TransitionJsConfig<typeof affordanceElementKind>
            )

            cancels.set(element, cancel)
            return
          }
        }

        // Appear
        if (statuses.get(element) !== 'appeared') {
          statuses.set(element, 'appeared')

          if ((element as SupportedElement).style.display === originalStyle.display) {
            // TODO: Should actually appear here
            return
          }

          if (transitionTypes.appear === 'none') {
            (element as SupportedElement).style.display = originalStyle.display
            return
          }

          if (transitionTypes.appear === 'css') {
            const cancel = transitionCss(element, {
              ...(appear as TransitionCss),
              start: addFrom => {
                ;(appear as TransitionCss).start?.()
                addFrom()
                ;(element as SupportedElement).style.display = originalStyle.display
              },
              end: removeTo => {
                removeTo()
                ;(appear as TransitionCss).end?.()
              },
              cancel: () => {
                ;(appear as TransitionCss).cancel?.()
              },
            })

            cancels.set(element, cancel)
            return
          }

          if (transitionTypes.appear === 'js') {
            const hooks = (
              (transition?.appear === true && transition?.enter)
              ||
              (!transition?.appear && {})
              ||
              (transition?.appear)
            )

            const cancel = transitionJs(
              affordanceElementKind,
              {
                row,
                column,
                before: (hooks as TransitionJs<B>)?.before,
                start: () => ((element as SupportedElement).style.display = originalStyle.display),
                active: (hooks as TransitionJs<B>)?.active,
                end: () => {},
                after: (hooks as TransitionJs<B>)?.after,
                cancel: (hooks as TransitionJs<B>)?.cancel,
              } as TransitionJsConfig<typeof affordanceElementKind>
            )

            cancels.set(element, cancel)
            return
          }

          if (transitionTypes.appear === 'enter') {
            enterEffect()
            return
          }
        }

        enterEffect()
      }
    },
    () => {},
    narrowBindValue(condition) as BindValue<B, boolean>,
    narrowWatchSourceOrSources(condition),
  )
}

export function defineTransition<B extends BindElement, TransitionType extends 'css' | 'js'>(
  transition: TransitionType extends 'css' ? TransitionCss : TransitionJs<B>
) {
  return transition
}

type TransitionJsConfig<A extends RenderedKind> = A extends 'element'
  ? {
    row: 0,
    column: 0,
    before: TransitionJs<SupportedElement>['before'],
    start: () => void,
    active: TransitionJs<SupportedElement>['active'],
    end: (status: TransitionStatus) => void,
    after: TransitionJs<SupportedElement>['after'],
    cancel: TransitionJs<SupportedElement>['cancel'],
  }
  : A extends 'list'
    ? {
      row: 0,
      column: number,
      before: TransitionJs<SupportedElement[]>['before'],
      start: () => void,
      active: TransitionJs<SupportedElement[]>['active'],
      end: (status: TransitionStatus) => void,
      after: TransitionJs<SupportedElement[]>['after'],
      cancel: TransitionJs<SupportedElement[]>['cancel'],
    }
    : {
      row: number,
      column: number,
      before: TransitionJs<Plane<SupportedElement>>['before'],
      start: () => void,
      active: TransitionJs<Plane<SupportedElement>>['active'],
      end: (status: TransitionStatus) => void,
      after: TransitionJs<Plane<SupportedElement>>['after'],
      cancel: TransitionJs<Plane<SupportedElement>>['cancel'],
    }

type TransitionStatus = 'ready' | 'transitioning' | 'transitioned' | 'canceled'

function transitionJs<A extends RenderedKind> (
  affordanceElementKind: A,
  config: TransitionJsConfig<A>,
) {
  let status: TransitionStatus = 'ready'

  const { row, column } = config,
        { before, start, active, end, after, cancel } = (() => {
          if (affordanceElementKind === 'plane') {
            return {
              before: () => (config as TransitionJsConfig<'plane'>).before?.({ row, column }),
              start: () => config.start?.(),
              active: () => (config as TransitionJsConfig<'plane'>).active?.({ row, column }, done),
              end: () => config.end?.(status),
              after: () => (config as TransitionJsConfig<'plane'>).after?.({ row, column }),
              cancel: () => (config as TransitionJsConfig<'plane'>).cancel?.({ row, column }),
            }
          }

          if (affordanceElementKind === 'list') {
            return {
              before: () => (config as TransitionJsConfig<'list'>).before?.(row),
              start: () => config.start?.(),
              active: () => (config as TransitionJsConfig<'list'>).active?.(row, done),
              end: () => config.end?.(status),
              after: () => (config as TransitionJsConfig<'list'>).after?.(row),
              cancel: () => (config as TransitionJsConfig<'list'>).cancel?.(row),
            }
          }

          return {
            before: () => (config as TransitionJsConfig<'element'>).before?.(),
            start: () => config.start?.(),
            active: () => (config as TransitionJsConfig<'element'>).active?.(done),
            end: () => config.end?.(status),
            after: () => (config as TransitionJsConfig<'element'>).after?.(),
            cancel: () => (config as TransitionJsConfig<'element'>).cancel?.(),
          }
        })(),
        done = () => {
          end()
          if (status === 'canceled') return
          after()
          status = 'transitioned'
        }

  before()

  start()
  status = 'transitioning'

  if (config.active) {
    active()
  } else {
    done()
  }

  return () => {
    if (status === 'transitioned') return false

    status = 'canceled'
    requestAnimationFrame(() => {
      cancel()
      done()
    })

    return true
  }
}

type TransitionCssConfig = Omit<TransitionCss, 'start' | 'end'> & {
  start: (addFrom: () => void) => void,
  end: (removeTo: () => void) => void,
}

function transitionCss (element: SupportedElement, config: TransitionCssConfig) {
  let status: TransitionStatus = 'ready'

  const from = config.from.split(' ') || [],
        active = config.active.split(' ') || [],
        to = config.to.split(' ') || [],
        transitionend = new Listenable('transitionend'),
        transitioncancel = new Listenable('transitioncancel'),
        end = () => {
          status = 'transitioned'

          transitionend.stop()
          transitioncancel.stop()

          requestAnimationFrame(() => {
            const removeTo = () => element.classList.remove(...active, ...to)
            config.end(removeTo)
          })
        },
        cancel = () => {
          transitioncancel.stop()
          transitionend.stop()

          requestAnimationFrame(() => {
            element.style.transitionProperty = ''
            config.cancel()
          })
        }

  transitionend.listen(event => {
    if (event.target !== element) return
    end()
  })

  transitioncancel.listen(event => {
    if (event.target !== element) return
    cancel()
  })

  const addFrom = () => element.classList.add(...from)
  config.start(addFrom)
  status = 'transitioning'

  requestAnimationFrame(() => {
    element.classList.add(...active)

    requestAnimationFrame(() => {
      element.classList.remove(...from)
      element.classList.add(...to)

      if (predicateInstantTransition(element)) end()
    })
  })

  return () => {
    if (status === 'transitioned') return false

    status = 'canceled'
    element.style.transitionProperty = 'none'
    element.classList.remove(...from, ...active, ...to)

    return true
  }
}

function predicateInstantTransition (element: SupportedElement) {
  return toComputedStyle(element).transitionDuration === '0s'
}

export function toTransitionTypes<B extends BindElement>({ appear = {}, enter = {}, leave = {} }: TransitionOption<B>): {
  appear: 'css' | 'js' | 'none' | 'enter',
  enter: 'css' | 'js' | 'none',
  leave: 'css' | 'js' | 'none',
} {
  const enterType = (() => {
          if ('from' in enter) return 'css'
          if (some<keyof TransitionJs<B>>(key => key in enter)(['before', 'active', 'after', 'cancel'])) return 'js'
          return 'none'
        })(),
        leaveType = (() => {
          if ('from' in leave) return 'css'
          if (some<keyof TransitionJs<B>>(key => key in leave)(['before', 'active', 'after', 'cancel'])) return 'js'
          return 'none'
        })(),
        appearType = (() => {
          if (appear === true) return 'enter'
          if ('from' in appear) return 'css'
          if (some<keyof TransitionJs<B>>(key => key in appear)(['before', 'active', 'after', 'cancel'])) return 'js'
          return 'none'
        })()

  return {
    appear: appearType,
    enter: enterType,
    leave: leaveType,
  }
}
