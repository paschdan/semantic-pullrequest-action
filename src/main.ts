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
    const api_url = process.env.GITHUB_API_URL

    const octoKit = github.getOctokit(token, {baseUrl: api_url})

    const owner = github.context.repo.owner
    const repo = github.context.repo.repo
    const pull_number = pr.number

    const livePr = await octoKit.pulls.get({
      owner,
      repo,
      pull_number
    })

    const prTitle = livePr.data.title

    let output = ''

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

    const {data: commits} = await octoKit.pulls.listCommits({
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

    if (output) {
      octoKit.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: output
      })

      throw new Error(output)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}
