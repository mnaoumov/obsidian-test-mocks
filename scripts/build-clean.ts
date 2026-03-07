import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { buildClean } from 'obsidian-dev-utils/ScriptUtils/build';

await wrapCliTask(() => buildClean());
