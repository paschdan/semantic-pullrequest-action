<p align="center">
  <a href="https://github.com/paschdan/semantic-pullrequest-action/actions"><img alt="typescript-action status" src="https://github.com/paschdan/semantic-pullrequest-action/workflows/build-test/badge.svg"></a>
</p>

# semantic pullrequest action

This github actions checks if a pull request has valid commits by using commitlint

* it will check the title of the PR
* it will check all commits of the PR
* it will comment on the PR if invalid messages are found.

## usage

```yaml
name: "Check for semantic PR"

on: 
  pull_request:
    types:
      - opened
      - edited
      - synchronize
        
jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: paschdan/semantic-pullrequest-action@v1
```

## inputs

### `token` (optional)

Personal access token (PAT) used to interact with the GitHub API.
By default, the automatic token provided by GitHub is used.
You can see more info about GitHub's default token [here](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token).

default: `${{ github.token }}`

### `help_url` (optional)

A URL that is shown when commits are not valid, to get help

default: https://www.conventionalcommits.org/en/v1.0.0/

### `config_file` (optional)

The commitlint config file to use for linting

### `verbose` (optional)

Should commitlint output also valid commits
