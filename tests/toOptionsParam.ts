export function toOptionsParam (options: Record<any, any>) {
  return `?options=${encodeURIComponent(JSON.stringify(options))}`
}
