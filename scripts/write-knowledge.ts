import { resolve, parse } from 'path'
import { Glob, file, write } from 'bun'

type GetKnowledgeConfig = {
  base: KnowledgeBase[],
  destination: string,
  baseCwd?: string,
}

type KnowledgeBase = {
  category: string,
  include: {
    patterns: ConstructorParameters<typeof Glob>[0][],
    should?: (api: { path: string, code: string }) => boolean,
  },
}

export async function getKnowledge ({ base, destination, baseCwd = process.cwd() }: GetKnowledgeConfig) {
  let totalFiles = 0
  let knowledge = '# Knowledge\n\n'

  for (const { category, include: { patterns, should = () => true } } of base) {
    knowledge += `## ${category}\n\n`

    for (
      const path of [
        ...new Set(
          patterns.flatMap(pattern => [...new Glob(pattern).scanSync({ cwd: baseCwd, dot: true })])
        ),
      ]
    ) {
      const code = await file(resolve(baseCwd, path)).text()

      if (!should({ path, code })) continue

      totalFiles++

      const { ext } = parse(path)

      knowledge += `
### ${path}

\`\`\`\`\`\`${ext.replace(leadingDotRE, '')}
${code}
\`\`\`\`\`\`
`
    }
  }

  await write(resolve(destination), knowledge)

  // eslint-disable-next-line no-console
  console.log(`Wrote ${totalFiles} files to ${destination}`)
}

const leadingDotRE = /^\./

getKnowledge({
  base: [
    {
      category: 'Source code',
      include: {
        patterns: ['src/**/*.ts'],
      },
    },
    {
      category: 'Tests',
      include: {
        patterns: ['tests/**/*.{ts,vue}'],
      },
    },
    {
      category: 'Docs',
      include: {
        patterns: [`${process.env.RELATIVE_PATH_TO_DOCS}/**/*.md`],
      },
    },
  ],
  destination: 'knowledge.md',
})
