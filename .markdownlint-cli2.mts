import relativeLinksRule from 'markdownlint-rule-relative-links';

export const config = {
  config: {
    'MD013': false,
    'MD024': {
      siblings_only: true
    },
    'MD052': {
      ignored_labels: [
        '!note',
        '!warning'
      ],
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
