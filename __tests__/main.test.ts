import * as github from '@actions/github'
import {getPullRequestObject} from '../src/main'

describe('getPullRequestObject when trigger is no pull request', () => {
  beforeEach(() => {
    github.context.payload = {
      comment: {
        id: 123
      }
    }
  })
  test('throws if trigger was no pull request', () => {
    expect(getPullRequestObject).toThrow(
      'this action should be triggered via a pull_request'
    )
  })
})
