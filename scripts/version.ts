import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { updateVersion } from 'obsidian-dev-utils/ScriptUtils/version';

const ARGV_VERSION_INDEX = 2;
await wrapCliTask(() => {
  const versionUpdateTypeStr = process.argv[ARGV_VERSION_INDEX];
  return updateVersion(versionUpdateTypeStr);
});
