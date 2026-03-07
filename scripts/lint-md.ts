import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { lintMarkdown } from 'obsidian-dev-utils/ScriptUtils/markdownlint/markdownlint';

await wrapCliTask(() => lintMarkdown());
