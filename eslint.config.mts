import { createEslintConfig } from './scripts/eslint.config.ts';

// eslint-disable-next-line import-x/no-default-export -- ESLint requires a default export.
export default createEslintConfig(import.meta.dirname);
