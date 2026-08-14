import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import { execFromRoot } from './helpers/root.ts';

exitIfScriptDisabled();

await execFromRoot(['jiti', 'scripts/docs-gen/generate-api-docs.ts']);
await execFromRoot(['jiti', 'scripts/docs-gen/generate-og-images.ts']);
await execFromRoot(['astro', 'build']);
await execFromRoot(['jiti', 'scripts/docs-link-check.ts']);
