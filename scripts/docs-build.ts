import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { buildDocsSite } from '@mnaoumov/typescript-dev-toolkit/docs-site/docs-site-commands';

import { DOCS_SITE_CONFIG } from './docs-site-config.ts';

await wrapCliTask(async () => {
  await buildDocsSite(DOCS_SITE_CONFIG);
});
