import type { WithPlaywrightOptions } from '@baleada/prepare'

export const withPlaywrightOptions: WithPlaywrightOptions = {
  launch: {
    executablePath: undefined, // TODO: better defaults from prepare
  },
}
