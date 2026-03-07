import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { execFromRoot } from 'obsidian-dev-utils/ScriptUtils/Root';

await wrapCliTask(async () => {
  await execFromRoot('cz');
});
