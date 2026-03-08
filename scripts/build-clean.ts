import { buildClean } from 'obsidian-dev-utils/ScriptUtils/build';
import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';

await wrapCliTask(() => buildClean());
