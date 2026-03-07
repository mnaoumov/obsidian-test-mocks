import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { updateVersion } from 'obsidian-dev-utils/ScriptUtils/version';

await wrapCliTask(() => {
  const versionUpdateTypeStr = process.argv[2];
  return updateVersion(versionUpdateTypeStr);
});
