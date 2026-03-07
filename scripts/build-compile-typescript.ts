import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { buildCompileTypeScript } from 'obsidian-dev-utils/ScriptUtils/build';

await wrapCliTask(() => buildCompileTypeScript());
