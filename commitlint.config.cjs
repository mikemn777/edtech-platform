/**
 * Commit message standard — Implementation Blueprint §9 (Conventional Commits).
 * type(scope): summary  — scope is the domain/module (e.g., booking, payments).
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'test', 'docs', 'chore', 'perf', 'security', 'build', 'ci'],
    ],
    'scope-empty': [1, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
  },
};
