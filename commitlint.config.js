// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const {maxLineLength} = require('@commitlint/ensure')

const bodyMaxLineLength = 100

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const validateBodyMaxLengthIgnoringDeps = parsedCommit => {
  const {type, scope, body} = parsedCommit
  const isDepsCommit =
    type === 'chore' && (scope === 'deps' || scope === 'deps-dev')

  return [
    isDepsCommit || !body || maxLineLength(body, bodyMaxLineLength),
    `body's lines must not be longer than ${bodyMaxLineLength}`
  ]
}

module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    'body-max-line-length': [0],
    'function-rules/body-max-line-length': [
      2,
      'always',
      validateBodyMaxLengthIgnoringDeps
    ]
  }
}
