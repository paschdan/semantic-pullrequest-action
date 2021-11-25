import * as core from '@actions/core'
import * as github from '@actions/github'
import {commitlint} from './commitlint'

export function getPullRequestObject(): {
  number: number
  html_url?: string
  body?: string
} {
  const pullRequestObject = github.context.payload.pull_request
  if (!pullRequestObject) {
    throw new Error('this action should be triggered via a pull_request')
  }
  return pullRequestObject
}

export async function run(): Promise<void> {
  try {
    const pr = getPullRequestObject()

    const token = core.getInput('token')

    const octoKit = github.getOctokit(token)

    const owner = github.context.repo.owner
    const repo = github.context.repo.repo
    const pull_number = pr.number

    let output = ''

    if (core.getBooleanInput('check_title')) {
      const livePr = await octoKit.rest.pulls.get({
        owner,
        repo,
        pull_number
      })

      const prTitle = livePr.data.title

      const prMessages = [prTitle]

      const prOutput = await commitlint(prMessages)
      if (prOutput) {
        output += `
please fix your pull request title:
\`\`\`

${prOutput}

\`\`\`

`
      }
    }

    if (core.getBooleanInput('check_commits')) {
      const {data: commits} = await octoKit.rest.pulls.listCommits({
        owner,
        repo,
        pull_number
      })

      const messages = commits.map(commitEntry => commitEntry.commit.message)

      const commitOutput = await commitlint(messages)
      if (commitOutput) {
        output += `
please fix your commits:
\`\`\`

${commitOutput}

\`\`\`

`
      }
    }

    if (output) {
      if (core.getBooleanInput('create_comment')) {
        octoKit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pull_number,
          body: output
        })
      }

      throw new Error(output)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
