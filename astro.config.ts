import { defineDocsSiteConfig } from '@mnaoumov/typescript-dev-toolkit/docs-site/astro-config';

import { DOCS_SITE_CONFIG } from './scripts/docs-site-config.ts';

// eslint-disable-next-line import-x/no-default-export -- Astro requires a default export.
export default defineDocsSiteConfig(DOCS_SITE_CONFIG);
