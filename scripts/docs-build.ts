import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import { resolveToolCommand } from './helpers/package-manager.ts';
import { execFromRoot } from './helpers/root.ts';

exitIfScriptDisabled();

await execFromRoot([...resolveToolCommand({ tool: 'jiti' }), 'scripts/docs-gen/generate-api-docs.ts']);
await execFromRoot([...resolveToolCommand({ tool: 'jiti' }), 'scripts/docs-gen/generate-og-images.ts']);
await execFromRoot([...resolveToolCommand({ tool: 'astro' }), 'build']);
await execFromRoot([...resolveToolCommand({ tool: 'jiti' }), 'scripts/docs-link-check.ts']);
