import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { spellcheck } from 'obsidian-dev-utils/ScriptUtils/spellcheck';

await wrapCliTask(() => spellcheck());
