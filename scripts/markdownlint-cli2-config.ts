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
  // The `docs/` Astro + Starlight sub-project follows Starlight's frontmatter-driven conventions
  // (title in frontmatter, no body H1) and holds generated API markdown; it is validated by its own
  // `astro build` and the link check that follows it, not by this repo's markdownlint.
  ignores: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'docs/**'
  ]
};
