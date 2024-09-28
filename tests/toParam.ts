import { Coordinates } from '../src/extracted'

export function toOptionsParam (options: Record<any, any>) {
  return `?options=${encodeURIComponent(JSON.stringify(options))}`
}

export function toDisabledListParam (disabled: number[]) {
  return `&disabled=${encodeURIComponent(JSON.stringify(disabled))}`
}

export function toDisabledPlaneParam (disabled: Coordinates[]) {
  return `&disabled=${encodeURIComponent(JSON.stringify(disabled))}`
}
