import load from '@commitlint/load'
import lint from '@commitlint/lint'
import {existsSync} from 'fs'
import {format} from '@commitlint/format'
import {resolve} from 'path'
import * as core from '@actions/core'
import {
  LintOptions,
  LintOutcome,
  ParserOptions,
  ParserPreset,
  QualifiedConfig
} from '@commitlint/types'

function selectParserOpts(parserPreset: ParserPreset): undefined | object {
  if (typeof parserPreset !== 'object') {
    return undefined
  }

  if (typeof parserPreset.parserOpts !== 'object') {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return parserPreset.parserOpts
}

async function loadConfig(): Promise<QualifiedConfig> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const workspacePath: string = process.env.GITHUB_WORKSPACE

  const configPath = resolve(workspacePath, core.getInput('config_file'))

  const config = existsSync(configPath)
    ? await load({}, {file: configPath})
    : await load({extends: ['@commitlint/config-conventional']})

  return config
}

export async function commitlint(
  messages: string[]
  // octoKit: InstanceType<typeof GitHub>
): Promise<string | undefined> {
  const loaded = await loadConfig()
  const parserOpts = selectParserOpts(loaded.parserPreset)
  const opts: LintOptions & {parserOpts: ParserOptions} = {
    parserOpts: {},
    plugins: {},
    ignores: [],
    defaultIgnores: true
  }
  if (parserOpts) {
    opts.parserOpts = parserOpts
  }
  if (loaded.plugins) {
    opts.plugins = loaded.plugins
  }
  if (loaded.ignores) {
    opts.ignores = loaded.ignores
  }
  if (loaded.defaultIgnores === false) {
    opts.defaultIgnores = false
  }

  const results = await Promise.all(
    messages.map(async message => lint(message, loaded.rules, opts))
  )

  const report = results.reduce<{
    valid: boolean
    errorCount: number
    warningCount: number
    results: LintOutcome[]
  }>(
    (info, result) => {
      info.valid = result.valid ? info.valid : false
      info.errorCount += result.errors.length
      info.warningCount += result.warnings.length
      info.results.push(result)

      return info
    },
    {
      valid: true,
      errorCount: 0,
      warningCount: 0,
      results: []
    }
  )

  const helpUrl = core.getInput('help_url')
  if (report.errorCount === 0) {
    return
  }

  const verbose = core.getInput('verbose') ? true : false

  return format(report, {
    color: false,
    verbose,
    helpUrl
  })
}
