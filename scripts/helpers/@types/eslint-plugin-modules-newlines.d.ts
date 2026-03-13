declare module 'eslint-plugin-modules-newlines' {
  import type { ESLint } from 'eslint';

  const plugin: ESLint.Plugin;

  // eslint-disable-next-line import-x/no-default-export -- This module only provides a default export.
  export default plugin;
}
