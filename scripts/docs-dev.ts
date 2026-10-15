import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { resolveToolCommand } from '@mnaoumov/typescript-dev-toolkit/package-manager';
import { execFromRoot } from '@mnaoumov/typescript-dev-toolkit/root';

await wrapCliTask(async () => {
  await execFromRoot([...resolveToolCommand({ tool: 'jiti' }), 'scripts/docs-gen/generate-api-docs.ts']);
  // `ASTRO_DEV_BACKGROUND` forces Astro's foreground dev server. Astro otherwise switches to a background launcher (hardcoded 30s startup timeout) under an agent / non-interactive environment.
  await execFromRoot([...resolveToolCommand({ tool: 'astro' }), 'dev'], {
    env: {
      ASTRO_DEV_BACKGROUND: '1'
    }
  });
});
