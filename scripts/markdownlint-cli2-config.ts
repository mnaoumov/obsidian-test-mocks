import relativeLinksRule from 'markdownlint-rule-relative-links';

export const config = {
  config: {
    'MD013': false,
    'MD024': {
      // eslint-disable-next-line camelcase -- External markdownlint config key.
      siblings_only: true
    },
    'MD052': {
      // eslint-disable-next-line camelcase -- External markdownlint config key.
      ignored_labels: [
        '!note',
        '!warning'
      ],
      // eslint-disable-next-line camelcase -- External markdownlint config key.
      shortcut_syntax: true
    },
    'relative-links': true
  },
  customRules: [
    relativeLinksRule
  ],
  globs: [
    '**/*.md'
  ],
  ignores: [
    'node_modules/**',
    '.git/**',
    'dist/**'
  ]
};
