import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { format } from 'obsidian-dev-utils/ScriptUtils/format';

await wrapCliTask(() => format());
