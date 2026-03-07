import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { lint } from 'obsidian-dev-utils/ScriptUtils/ESLint/ESLint';

await wrapCliTask(() => lint());
