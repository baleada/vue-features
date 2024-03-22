export function toOptionsParam (options: Record<any, any>) {
  return `?options=${encodeURIComponent(JSON.stringify(options))}`
}

export function toDisabledParam (disabled: number[]) {
  return `&disabled=${encodeURIComponent(JSON.stringify(disabled))}`
}
