import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { resolveToolCommand } from '@mnaoumov/typescript-dev-toolkit/package-manager';
import { execFromRoot } from '@mnaoumov/typescript-dev-toolkit/root';

await wrapCliTask(async () => {
  await execFromRoot([...resolveToolCommand({ tool: 'jiti' }), 'scripts/docs-gen/generate-api-docs.ts']);
  await execFromRoot([...resolveToolCommand({ tool: 'jiti' }), 'scripts/docs-gen/generate-og-images.ts']);
  await execFromRoot([...resolveToolCommand({ tool: 'astro' }), 'build']);
  await execFromRoot([...resolveToolCommand({ tool: 'jiti' }), 'scripts/docs-link-check.ts']);
});
