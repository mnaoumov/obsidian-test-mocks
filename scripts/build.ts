import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';
import { npmRun } from 'obsidian-dev-utils/ScriptUtils/NpmRun';

await wrapCliTask(async () => {
  await npmRun('build:clean');
  await npmRun('build:compile:typescript');
  await npmRun('build:types');
  await npmRun('build:lib');
});
