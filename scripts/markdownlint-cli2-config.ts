import relativeLinksRule from 'markdownlint-rule-relative-links';

import type { MarkdownlintCli2ConfigurationSchema as MarkdownlintCli2ConfigSchema } from './helpers/@types/markdownlint-cli2-config-schema.d.ts';

export const config: MarkdownlintCli2ConfigSchema = {
  config: {
    'MD013': false,
    'MD024': {
      // eslint-disable-next-line camelcase -- That's how it is defined in the schema.
      siblings_only: true
    },
    'MD052': {
      // eslint-disable-next-line camelcase -- That's how it is defined in the schema.
      ignored_labels: [
        '!important',
        '!note',
        '!warning'
      ],
      // eslint-disable-next-line camelcase -- That's how it is defined in the schema.
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
