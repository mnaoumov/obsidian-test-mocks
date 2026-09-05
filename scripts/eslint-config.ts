import type { Linter } from 'eslint';

import commentsConfigs from '@eslint-community/eslint-plugin-eslint-comments/configs';
import { includeIgnoreFile } from '@eslint/config-helpers';
import eslint from '@eslint/js';
// eslint-disable-next-line import-x/no-rename-default -- The default export name `plugin` is too confusing.
import stylistic from '@stylistic/eslint-plugin';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
// eslint-disable-next-line import-x/no-rename-default -- The default export name `plugin` says nothing about which plugin it is.
import astro from 'eslint-plugin-astro';
import { flatConfigs as eslintPluginImportXFlatConfigs } from 'eslint-plugin-import-x';
import { configs as perfectionistConfigs } from 'eslint-plugin-perfectionist';
// eslint-disable-next-line import-x/no-rename-default -- The default export name `index` is too confusing.
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import { join } from 'node:path/posix';
// eslint-disable-next-line import-x/no-rename-default -- The default export name `_default` is too confusing.
import tseslint from 'typescript-eslint';

import { obsidianDevUtilsPlugin } from './helpers/eslint-rules/obsidian-dev-utils-plugin.ts';
import { getRootFolder } from './helpers/root.ts';

// The `docs/src/**/*.ts` modules are deliberately absent (and ignored outright below): they resolve
// `astro:content` and `import.meta.env` through the types Astro generates into the gitignored
// `docs/.astro/`, so type-aware linting reports every Astro import as an unresolved `any` on a tree
// That has not been built yet. The Astro build, and `docs/tsconfig.json`, are what validate them.
const typeScriptFiles = [
  'src/**/*.ts',
  'scripts/**/*.ts',
  'astro.config.ts'
];

const testFiles = [
  'src/**/*.test.ts',
  'scripts/**/*.test.ts'
];

export const config: Linter.Config[] = defineConfig(
  includeIgnoreFile(join(getRootFolder() ?? '', '.gitignore')),
  {
    ignores: ['docs/src/**/*.ts']
  },
  {
    /*
     * A waiver that no longer silences anything is worse than no waiver: it names a rule as the reason for
     * the code below it, and that reason has quietly stopped being true. ESLint reports these at `warn` by
     * default, and `npm run lint` passes no `--max-warnings 0`, so the default would let stale waivers
     * accumulate unnoticed. Every rule in this config is an error; the directives that claim to suppress
     * them are held to the same bar.
     */
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  ...getAstroConfigs(),
  ...getEslintConfigs(),
  ...getLocalPluginConfigs(),
  ...getTseslintConfigs(),
  // Must follow `getTseslintConfigs()`, which turns `projectService` on for every TypeScript file. This
  // Override turns it back off for the one file that needs a named project instead.
  ...getAstroConfigTypeCheckingConfigs(),
  ...getStylisticConfigs(),
  ...getImportXConfigs(),
  ...getPerfectionistConfigs(),
  ...getUnicornConfigs(),
  ...getEslintImportResolverTypescriptConfigs(),
  ...getEslintCommentsConfigs()
);

function getAstroConfigs(): Linter.Config[] {
  // eslint-disable-next-line import-x/no-named-as-default-member -- `configs` is the plugin's configuration namespace.
  return defineConfig(astro.configs.recommended);
}

/**
 * Point type-aware linting of `astro.config.ts` at its own tsconfig.
 *
 * The root `tsconfig.json` deliberately does not include it: the file imports the Astro/Starlight ESM
 * packages, which only resolve under `moduleResolution: bundler`, and the root project is `node16`.
 * `tsconfig.astro.json` is that one-file bundler-resolution project.
 */
function getAstroConfigTypeCheckingConfigs(): Linter.Config[] {
  return defineConfig({
    files: ['astro.config.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.astro.json',
        projectService: false,
        // eslint-disable-next-line unicorn/name-replacements -- `tsconfigRootDir` is `typescript-eslint`'s option name, which has to be spelled the way `typescript-eslint` reads it.
        tsconfigRootDir: getRootFolder() ?? ''
      }
    }
  });
}

function getEslintCommentsConfigs(): Linter.Config[] {
  return defineConfig([
    {
      // eslint-disable-next-line import-x/no-named-as-default-member -- The default export name `recommended` is too confusing.
      extends: [commentsConfigs.recommended],
      files: typeScriptFiles,
      rules: {
        '@eslint-community/eslint-comments/require-description': 'error'
      }
    }
  ]);
}

function getEslintConfigs(): Linter.Config[] {
  return defineConfig([
    {
      extends: [eslint.configs.recommended],
      files: typeScriptFiles,
      rules: {
        'accessor-pairs': 'error',
        'array-callback-return': 'error',
        'camelcase': 'error',
        'capitalized-comments': ['error', 'always', { block: { ignorePattern: 'v8' } }],
        'complexity': 'error',
        'consistent-this': 'error',
        'curly': 'error',
        'default-case': 'error',
        'default-case-last': 'error',
        'default-param-last': 'error',
        'eqeqeq': 'error',
        'func-name-matching': 'error',
        'func-names': 'error',
        'func-style': [
          'error',
          'declaration',
          {
            allowArrowFunctions: false
          }
        ],
        'grouped-accessor-pairs': [
          'error',
          'getBeforeSet'
        ],
        'guard-for-in': 'error',
        'no-alert': 'error',
        'no-array-constructor': 'error',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-console': [
          'error',
          {
            allow: [
              'warn',
              'error'
            ]
          }
        ],
        'no-constructor-return': 'error',
        'no-div-regex': 'error',
        'no-else-return': [
          'error',
          {
            allowElseIf: false
          }
        ],
        'no-empty-function': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        'no-implicit-coercion': [
          'error',
          {
            allow: [
              '!!'
            ]
          }
        ],
        'no-implied-eval': 'error',
        'no-inner-declarations': 'error',
        'no-iterator': 'error',
        'no-label-var': 'error',
        'no-labels': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-loop-func': 'error',
        'no-magic-numbers': [
          'error',
          {
            detectObjects: true,
            enforceConst: true,
            ignore: [
              -1,
              0,
              1
            ]
          }
        ],
        'no-multi-assign': 'error',
        'no-multi-str': 'error',
        'no-negated-condition': 'error',
        'no-nested-ternary': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-object-constructor': 'error',
        'no-octal-escape': 'error',
        'no-promise-executor-return': 'error',
        'no-proto': 'error',
        'no-restricted-syntax': [
          'error',
          {
            message: 'Do not use definite assignment assertions (!). Initialize the field or make it optional.',
            selector: 'PropertyDefinition[definite=true]'
          },
          {
            message: 'Do not use definite assignment assertions (!) on abstract fields.',
            selector: 'TSAbstractPropertyDefinition[definite=true]'
          },
          {
            message: 'Do not use anonymous inline object types. Define a named interface or `type` alias instead.',
            selector: 'TSTypeLiteral:not(TSTypeAliasDeclaration > TSTypeLiteral)'
          },
          {
            message: 'Do not use anonymous inline mapped types. Define a named `type` alias instead.',
            selector: 'TSMappedType:not(TSTypeAliasDeclaration > TSMappedType)'
          },
          {
            message: 'Do not use override on __ methods. Use a numbered variant instead, e.g., method2__().',
            selector: 'MethodDefinition[override=true][key.name=/.*__$/]'
          },
          {
            message: 'Do not use double type assertions (as X as Y). Use castTo<T>() from src/internal/castTo.ts instead.',
            selector: 'TSAsExpression > TSAsExpression'
          },
          {
            message: 'Do not use `as never`. It silently satisfies type constraints by claiming "this value is of every type" — almost always masks a real type mismatch. Fix the underlying types instead.',
            selector: 'TSAsExpression > TSNeverKeyword'
          },
          {
            message: 'Do not use `<never>` type assertions. Same reasoning as `as never`.',
            selector: 'TSTypeAssertion > TSNeverKeyword'
          },
          {
            message: 'Do not use _ prefix on methods or functions. The _ prefix is for unused parameters only.',
            selector: 'MethodDefinition[key.name=/^_/]:not([override=true])'
          },
          {
            message: 'Do not use _ prefix on methods or functions. The _ prefix is for unused parameters only.',
            selector: 'FunctionDeclaration[id.name=/^_/]'
          },
          {
            message: 'Do not rename imports with "Mock" in the alias. Mock classes are the canonical types in this project — use the original name.',
            selector: 'ImportSpecifier[local.name=/Mock/]:not([imported.name=/Mock/])'
          },
          {
            message: 'Avoid dynamic import(). Use static imports instead. Only use dynamic imports for lazy/conditional loading.',
            selector: 'ImportExpression'
          },
          {
            message: 'Do not use `{} as T`. Use `castTo<T>()` from src/internal/castTo.ts instead.',
            selector: 'TSAsExpression > ObjectExpression[properties.length=0]'
          },
          {
            message: 'Do not use `declare` on class properties. Initialize the property or use a regular type annotation.',
            selector: 'PropertyDefinition[declare=true]'
          }
        ],
        'no-return-assign': 'error',
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-shadow': 'error',
        'no-template-curly-in-string': 'error',
        'no-throw-literal': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-unneeded-ternary': 'error',
        'no-unreachable-loop': 'error',
        'no-unused-expressions': 'error',
        'no-useless-assignment': 'error',
        'no-useless-call': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-concat': 'error',
        'no-useless-constructor': 'error',
        'no-useless-rename': 'error',
        'no-useless-return': 'error',
        'no-var': 'error',
        'no-void': 'error',
        'object-shorthand': 'error',
        'operator-assignment': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-const': 'error',
        'prefer-exponentiation-operator': 'error',
        'prefer-named-capture-group': 'error',
        'prefer-numeric-literals': 'error',
        'prefer-object-has-own': 'error',
        'prefer-object-spread': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-regex-literals': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'radix': 'error',
        'require-atomic-updates': 'error',
        'require-await': 'error',
        'symbol-description': 'error',
        'unicode-bom': 'error',
        'vars-on-top': 'error',
        'yoda': 'error'
      }
    },
    {
      // `src/internal/` is in scope for both rules: L3 forbids the import across `src/`, and the L9
      // `return strictProxy(this)` constructor pattern reaches here too, because an obsidian-typings
      // Interface with no `obsidian.d.ts` class is implemented in `src/internal/` (L1, L7).
      files: [
        'src/internal/**/*.ts',
        'src/obsidian/**/*.ts'
      ],
      rules: {
        'no-constructor-return': 'off',
        'no-restricted-imports': ['error', {
          paths: [{
            message: 'Do not import obsidian-typings in src/. Inline needed type shapes in src/internal/types.ts instead.',
            name: 'obsidian-typings'
          }],
          patterns: [{
            group: ['obsidian-typings/*'],
            message: 'Do not import obsidian-typings in src/. Inline needed type shapes in src/internal/types.ts instead.'
          }]
        }]
      }
    },
    {
      files: ['scripts/**/*.ts'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['scripts/helpers/@types/markdownlint-cli2-config-schema.d.ts'],
      rules: {
        'no-restricted-syntax': 'off'
      }
    },
    {
      files: ['**/*.test.ts', 'scripts/eslint-config.ts'],
      rules: {
        'no-magic-numbers': 'off'
      }
    }
  ]);
}

function getEslintImportResolverTypescriptConfigs(): Linter.Config[] {
  return defineConfig([
    {
      settings: {
        'import-x/resolver-next': [
          createTypeScriptImportResolver({
            alwaysTryTypes: true
          })
        ]
      }
    }
  ]);
}

function getImportXConfigs(): Linter.Config[] {
  return defineConfig([
    {
      extends: [
        eslintPluginImportXFlatConfigs.recommended,
        eslintPluginImportXFlatConfigs.typescript,
        eslintPluginImportXFlatConfigs.errors,
        eslintPluginImportXFlatConfigs.warnings
      ],
      files: typeScriptFiles,
      rules: {
        'import-x/consistent-type-specifier-style': 'error',
        'import-x/extensions': ['error', 'ignorePackages'],
        'import-x/first': 'error',
        'import-x/imports-first': 'error',
        'import-x/newline-after-import': 'error',
        'import-x/no-absolute-path': 'error',
        'import-x/no-amd': 'error',
        'import-x/no-anonymous-default-export': 'error',
        'import-x/no-commonjs': 'error',
        'import-x/no-cycle': 'error',
        'import-x/no-default-export': 'error',
        'import-x/no-deprecated': 'error',
        'import-x/no-duplicates': 'error',
        'import-x/no-dynamic-require': 'error',
        'import-x/no-empty-named-blocks': 'error',
        'import-x/no-extraneous-dependencies': 'error',
        'import-x/no-import-module-exports': 'error',
        'import-x/no-mutable-exports': 'error',
        'import-x/no-named-default': 'error',
        'import-x/no-namespace': 'error',
        'import-x/no-nodejs-modules': 'error',
        'import-x/no-relative-packages': 'error',
        'import-x/no-restricted-paths': 'error',
        'import-x/no-self-import': 'error',
        'import-x/no-unassigned-import': [
          'error',
          {
            allow: [
              '**/*.css',
              '**/*.sass',
              '**/*.scss'
            ]
          }
        ],
        'import-x/no-unused-modules': 'off',
        'import-x/no-useless-path-segments': 'error',
        'import-x/no-webpack-loader-syntax': 'error'
      }
    },
    {
      // `astro.config.ts` is build tooling like the rest: it reads the generated sidebar off disk.
      files: ['scripts/**/*.ts', 'src/script-utils/**/*.ts', 'astro.config.ts'],
      rules: {
        'import-x/no-nodejs-modules': 'off'
      }
    },
    {
      /*
       * A test runs under vitest in Node and is never part of the published library, so the ban on Node
       * builtins does not apply to it — the same argument the tooling block above already accepts. This is
       * what lets the two conformance tests read `obsidian.d.ts` and the checked-in typings inventory off
       * disk without an inline waiver at each import.
       *
       * Ported from `obsidian-dev-utils`' shared config, whose `getNodeBuiltinsConfigs` exempts
       * `context.testFiles` the same way. Only the `import-x` half comes across: the twin
       * `obsidianmd/no-nodejs-modules` there arrives with the plugin-directory rules, which this package
       * does not register.
       */
      files: testFiles,
      rules: {
        'import-x/no-nodejs-modules': 'off'
      }
    }
  ]);
}

function getLocalPluginConfigs(): Linter.Config[] {
  return defineConfig([{
    files: typeScriptFiles,
    plugins: {
      'obsidian-dev-utils': obsidianDevUtilsPlugin
    },
    rules: {
      'obsidian-dev-utils/no-async-callback-to-unsafe-return': 'error',
      'obsidian-dev-utils/no-unused-params-members': 'error',
      'obsidian-dev-utils/no-used-underscore-variables': 'error',
      'obsidian-dev-utils/params-options-name-match': 'error',
      'obsidian-dev-utils/prefer-noop-async': 'error',
      'obsidian-dev-utils/readonly-params-options-result-members': 'error'
    }
  }]);
}

function getPerfectionistConfigs(): Linter.Config[] {
  return defineConfig([{
    extends: [perfectionistConfigs['recommended-alphabetical']],
    files: typeScriptFiles
  }]);
}

function getStylisticConfigs(): Linter.Config[] {
  return defineConfig([
    {
      extends: [
        stylistic.configs.recommended,
        stylistic.configs.customize({
          arrowParens: true,
          braceStyle: '1tbs',
          commaDangle: 'never',
          semi: true
        })
      ],
      files: typeScriptFiles,
      rules: {
        '@stylistic/generator-star-spacing': 'off',
        '@stylistic/indent': 'off',
        '@stylistic/indent-binary-ops': 'off',
        '@stylistic/jsx-one-expression-per-line': 'off',
        '@stylistic/no-extra-semi': 'error',
        '@stylistic/object-curly-newline': [
          'error',
          {
            ExportDeclaration: {
              minProperties: 2,
              multiline: true
            },
            ImportDeclaration: {
              minProperties: 2,
              multiline: true
            }
          }
        ],
        '@stylistic/operator-linebreak': [
          'error',
          'before',
          {
            overrides: {
              '=': 'after'
            }
          }
        ],
        '@stylistic/quotes': [
          'error',
          'single',
          {
            allowTemplateLiterals: 'never'
          }
        ]
      }
    }
  ]);
}

function getTseslintConfigs(): Linter.Config[] {
  return defineConfig([
    {
      extends: [
        // eslint-disable-next-line import-x/no-named-as-default-member -- The default export name `_default` is too confusing.
        ...tseslint.configs.strictTypeChecked,
        // eslint-disable-next-line import-x/no-named-as-default-member -- The default export name `_default` is too confusing.
        ...tseslint.configs.stylisticTypeChecked
      ],
      files: typeScriptFiles,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          },
          projectService: true,
          // eslint-disable-next-line unicorn/name-replacements -- `tsconfigRootDir` is `typescript-eslint`'s option name, which has to be spelled the way `typescript-eslint` reads it.
          tsconfigRootDir: getRootFolder() ?? ''
        }
      },
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/method-signature-style': ['error', 'method'],
        '@typescript-eslint/no-floating-promises': ['error', {
          checkThenables: true
        }],
        '@typescript-eslint/no-invalid-void-type': ['error', {
          allowAsThisParameter: true
        }],
        '@typescript-eslint/no-this-alias': ['error', {
          allowedNames: [
            'that'
          ]
        }],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            // eslint-disable-next-line unicorn/name-replacements -- `args` is ESLint's option name, which has to be spelled the way ESLint reads it.
            args: 'all',
            // eslint-disable-next-line unicorn/name-replacements -- `argsIgnorePattern` is `typescript-eslint`'s option name, which has to be spelled the way `typescript-eslint` reads it.
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            ignoreRestSiblings: true,
            // eslint-disable-next-line unicorn/name-replacements -- `varsIgnorePattern` is `typescript-eslint`'s option name, which has to be spelled the way `typescript-eslint` reads it.
            varsIgnorePattern: '^_'
          }
        ],
        '@typescript-eslint/prefer-readonly': 'error'
      }
    },
    {
      files: testFiles,
      rules: {
        '@typescript-eslint/dot-notation': ['error', {
          allowPrivateClassPropertyAccess: true,
          allowProtectedClassPropertyAccess: true
        }],
        '@typescript-eslint/unbound-method': 'off'
      }
    },
    {
      settings: {
        react: {
          version: 'detect'
        }
      }
    }
  ]);
}

function getUnicornConfigs(): Linter.Config[] {
  return defineConfig([
    {
      extends: [unicorn.configs.recommended],
      files: typeScriptFiles,
      rules: {
        /*
         * Every static factory here (`create__`, `fromOriginalType__`, ...) names its own class on purpose,
         * and each mock class redeclares its factories rather than overriding an inherited one — that is why
         * `ButtonComponent` spells its variant `fromOriginalType2__` instead of overriding
         * `BaseComponent.fromOriginalType__`. Swapping the class name for `this` would make an inherited
         * factory build the SUBCLASS while its signature still says the base, turning a deliberate concrete
         * reference into a type lie. `strictProxy(value, App)` also passes the class as a runtime VALUE, where
         * `this` is a different object entirely.
         */
        'unicorn/class-reference-in-static-methods': 'off',
        /*
         * A boolean whose name reads as a question needs a prefix, but the rule's defaults force ungrammatical
         * ones — `isFolderExists` rather than `doesFolderExist`. These entries EXTEND the defaults (`is`, `has`,
         * `can`, `should`, ...) rather than replace them, so an unprefixed boolean is still rejected; the rule
         * just stops insisting the prefix come from the shorter list.
         */
        'unicorn/consistent-boolean-name': [
          'error',
          {
            prefixes: {
              allows: true,
              check: true,
              contains: true,
              does: true,
              includes: true,
              must: true,
              needs: true,
              supports: true
            }
          }
        ],
        /*
         * Unsatisfiable alongside `perfectionist/sort-classes`, which is configured here as a plain
         * alphabetical sort. This rule wants a category order (all fields, then the constructor, then all
         * methods), so a field paired with an accessor is rejected by whichever rule loses: alphabetically the
         * accessor may precede the field, by category the field always precedes the accessor. Neither ships a
         * fixer for the clash and both are `error`, so no member arrangement satisfies them both. The
         * alphabetical sort is the one already rolled out here, so it keeps precedence.
         */
        'unicorn/consistent-class-member-order': 'off',
        /*
         * The mocked file-system layer builds `Error` values whose message is assembled by the caller, and the
         * rule cannot tell those from an error thrown at a user.
         */
        'unicorn/error-message': 'off',
        /*
         * Source files are named after the API they mock, so the name is dictated by Obsidian and the DOM
         * rather than by a casing convention: `Array.prototype.ts` mocks `Array.prototype`, `App.ts` mocks
         * `App`, `createEl.ts` mocks the global `createEl`. Renaming them to kebab case would sever the 1:1
         * mapping the whole package is read through. Internal modules with no API to mirror (`in-memory-adapter.ts`)
         * stay kebab case, and allowing all three cases keeps the rule catching genuinely inconsistent names
         * such as `Snake_case`.
         */
        'unicorn/filename-case': [
          'error',
          {
            cases: {
              camelCase: true,
              kebabCase: true,
              pascalCase: true
            },
            // `sanitizeHTMLToDom` is Obsidian's own spelling, acronym and all. None of the three cases can express an embedded acronym, so the one file mirroring it is named exactly after the API and listed here.
            ignore: [/^sanitizeHTMLToDom\./]
          }
        ],
        /*
         * The default style for `node:path` is a default import, but this codebase imports its members by name
         * throughout, consistently with every other `node:` module it uses.
         */
        'unicorn/import-style': [
          'error',
          {
            styles: {
              // Keyed by the UNPREFIXED module name: the rule's own table uses `path`, so a `node:path` key never matches.
              path: {
                named: true
              }
            }
          }
        ],
        /*
         * The rule counts through array and object literals, so its default of 3 reports ordinary mock
         * composition — a fixture built as `App.createConfigured__({ files: { ... } })` nested inside an
         * assertion. Raising the limit by one clears the reports here while still catching genuinely
         * unreadable nesting.
         */
        'unicorn/max-nested-calls': [
          'error',
          {
            max: 4
          }
        ],
        'unicorn/name-replacements': [
          'error',
          {
            /*
             * Property and member names are checked too, so an abbreviation cannot survive by living on an
             * object rather than in a variable.
             *
             * The disabled replacements below are established vocabulary rather than abbreviations to be
             * expanded. `el` is the largest: Obsidian names every element member that way — `containerEl`,
             * `contentEl`, `inputEl`, `selectEl` — and this package exists to reproduce that surface member for
             * member, so expanding ours would make the mocks stop matching the API they mock. `attr`/`attrs`
             * are Obsidian's own too (`createEl('a', { attr: { ... } })` takes them by those names on
             * `DomElementInfo`), and `ref` matches Obsidian's `EventRef`.
             *
             * `params` is the parameter-bag convention enforced by
             * `obsidian-dev-utils/params-options-name-match`, which requires bag types to be named
             * `<Owner>Params` / `<Owner>Options`; expanding it to `Parameters` would put the two rules in direct
             * contradiction. `doc`, `docs`, `env`, `dist`, `lib`, `src`, `util` and `utils` are the clearer
             * spelling here — and `src` additionally corrupts code, since the fixer renames enum members while
             * leaving every `.Src` reference dangling.
             *
             * NOTE: this rule's autofix is NOT reference-aware for declarations that participate in a contract —
             * enum members, interface members, and TypeScript parameter properties are renamed while `this.el`
             * and `Enum.Member` references are left dangling. Apply its reports by hand; never run `--fix` over it.
             */
            checkProperties: true,
            replacements: {
              attr: false,
              attrs: false,
              dev: false,
              /*
               * Every `dir` here is a filesystem directory, never a direction, so the rule is narrowed to the
               * one expansion rather than left offering a choice it cannot make.
               */
              // eslint-disable-next-line unicorn/name-replacements -- This is the rule's own replacement key, which has to be spelled the way the rule reads it.
              dir: {
                direction: false,
                directory: true
              },
              dist: false,
              doc: false,
              docs: false,
              el: false,
              env: false,
              lib: false,
              params: false,
              props: false,
              ref: false,
              refs: false,
              src: false,
              util: false,
              utils: false
            }
          }
        ],
        /*
         * The next rules all suggest an API newer than this project's `lib` (`ES2022`), so following any of
         * them fails to compile. The floor is not arbitrary: it is the ECMAScript version of the oldest
         * Obsidian installer still able to run current Obsidian, which is what these mocks stand in for. Each
         * is off at the config level rather than annotated per site, because none can ever be satisfied while
         * that floor holds. Revisit them together if it moves.
         *
         * `Array#toReversed` and `Array#toSorted` are ES2023.
         */
        'unicorn/no-array-reverse': 'off',
        'unicorn/no-array-sort': 'off',
        /*
         * `continue` inside a nested loop is ordinary, readable control flow here. The rule's remedy is to
         * extract every such loop into its own function, which spreads one coherent traversal across two
         * declarations without making anything clearer.
         */
        'unicorn/no-break-in-nested-loop': 'off',
        /*
         * Installing and restoring global test doubles by assigning onto the global object is this package's
         * entire purpose — `setupNodePrototype` and its siblings exist to do exactly what the rule forbids.
         * It cannot separate that from an accidental global write, and it has no fixer.
         */
        'unicorn/no-global-object-property-assignment': 'off',
        // `null` is load-bearing here: the DOM APIs being mocked return `null` (`getAttribute`, `ownerDocument`), so `null` and `undefined` are not interchangeable.
        'unicorn/no-null': 'off',
        /*
         * `Setting.then()` and `BaseComponent.then()` are Obsidian's own public API — the chainable callback
         * hook every settings tab is written against. These mocks cannot drop a member of the surface they
         * exist to reproduce.
         */
        'unicorn/no-thenable': 'off',
        // Same call as its object counterpart: the destructuring depth flagged here is deliberate and reads well.
        'unicorn/no-unreadable-array-destructuring': 'off',
        /*
         * The reports are all `for (const entry of await adapter.list(...))`, which reads exactly as intended.
         * Hoisting the awaited call into a variable named after the loop's own iterable adds a line and a name
         * without adding information.
         */
        'unicorn/no-unreadable-for-of-expression': 'off',
        /*
         * `checkArguments` strips `undefined` arguments, which shifts the remaining positional arguments into
         * the wrong slots — fatal for mocks that assert exactly what Obsidian passes through. The rule's
         * remaining cases (a bare `undefined` initializer, `return undefined;` in a void function) are still
         * worth having.
         */
        'unicorn/no-useless-undefined': [
          'error',
          {
            checkArguments: false,
            checkArrowFunctionBody: false
          }
        ],
        // `Array.fromAsync` is ES2024. See the ES2022 floor note above.
        'unicorn/prefer-array-from-async': 'off',
        /*
         * Every hit is a promise deliberately NOT awaited: a test holds an unresolved promise and asserts the
         * callback has not fired yet, so awaiting would hang the test or invert what it proves. The rule cannot
         * tell a forgotten `await` from an intentional one.
         */
        'unicorn/prefer-await': 'off',
        /*
         * The reports read HTML out (`const html = el.innerHTML`), never write it, and for a read `getHTML()`
         * returns the same string. What it adds is shadow-root serialization options that nothing here asks
         * for, in exchange for a much newer platform floor than `innerHTML` — a bad trade for mocks that have
         * to run on whatever Chromium the installed Obsidian ships.
         */
        'unicorn/prefer-dom-node-html-methods': 'off',
        /*
         * Obsidian's `Component` has its own `removeChild(component)` for the component lifecycle, unrelated to
         * `Node#removeChild`. The rule matches on the method name alone, so every report here is a component
         * being unloaded, and following the advice calls a `remove()` that does not exist.
         */
        'unicorn/prefer-dom-node-remove': 'off',
        /*
         * These mocks reproduce the Obsidian renderer, where `window` and `document` are the canonical globals
         * and the source being mirrored spells them that way — `Node.prototype.doc` falls back to the global
         * `document` verbatim because Obsidian's own implementation does. Rewriting them to `globalThis` would
         * make the mock stop reading like the API it stands in for.
         */
        'unicorn/prefer-global-this': 'off',
        // `Iterator#toArray` and the iterator helpers are ES2025. See the ES2022 floor note above.
        'unicorn/prefer-iterator-to-array': 'off',
        /*
         * The suggested replacement is `Math.trunc(Number(x))`, which is longer than `parseInt(x, 10)` and not
         * the same function: `parseInt` stops at the first character that cannot be part of the number, so
         * `'12abc'` parses to 12 where `Number` yields `NaN`. The mocked components parse user input through
         * exactly that difference.
         */
        'unicorn/prefer-number-coercion': 'off',
        /*
         * The rule ranks operands by syntactic shape, not cost, so the reports swap one property read ahead of
         * another and buy nothing. Its own message concedes it cannot check the part that matters — "after
         * verifying short-circuit behavior" — and the current orders carry intent: a null guard before the use
         * it guards.
         */
        'unicorn/prefer-simple-condition-first': 'off',
        /*
         * Every array reported here holds strings, where the default sort is already well defined and correct.
         * Adding the comparator the rule asks for would mean choosing between code-unit and locale ordering, so
         * following it would CHANGE the sort rather than document it.
         */
        'unicorn/require-array-sort-compare': 'off',
        // The codebase already spells encodings the way the Encoding Standard does (`utf-8`), which is also what `TextDecoder` reports. Keep the rule enforcing consistency, just in the direction already in use.
        'unicorn/text-encoding-identifier-case': [
          'error',
          {
            withDash: true
          }
        ]
      }
    },
    {
      // Build/lint/version scripts are CLI entry points, where exiting with a status code is the interface.
      files: ['scripts/**/*.ts'],
      rules: {
        'unicorn/no-process-exit': 'off',
        'unicorn/no-top-level-side-effects': 'off'
      }
    },
    {
      files: testFiles,
      rules: {
        /*
         * A per-suite factory (`createElement`, `createConfiguredApp`) is deliberately local, keeping each
         * suite's fixture next to the assertions that read it. Production code keeps the check.
         */
        'unicorn/consistent-function-scoping': 'off',
        /*
         * The `data-*` tests assert the ATTRIBUTE surface these mocks implement — `getAttr`, `setAttr` and
         * `removeAttr` are defined in terms of `getAttribute`/`setAttribute`, so the assertions have to read
         * back through the same API. `dataset` is also not equivalent: it reports a missing key as `undefined`
         * where `getAttribute` returns `null`, so the rule's rewrite silently breaks every `toBeNull()`.
         */
        'unicorn/dom-node-dataset': 'off',
        /*
         * A module-level fixture assigned from `beforeEach` is the standard test shape. The rule is right about
         * production code, but in tests holding it in a `const` object would replace every `app` with
         * `STATE.app` and make each file read worse, since the fixture is reset per test by design.
         */
        'unicorn/no-top-level-assignment-in-function': 'off'
      }
    },
    {
      /*
       * A generated declaration file, reproduced from `markdownlint-cli2`'s own JSON schema. Its union member
       * order and its type names both come from the generator, so neither is ours to change: renaming a type
       * here would just be undone the next time the schema is regenerated.
       */
      files: ['scripts/helpers/@types/markdownlint-cli2-config-schema.d.ts'],
      rules: {
        'unicorn/name-replacements': 'off',
        'unicorn/prefer-type-literal-last': 'off'
      }
    },
    {
      /*
       * The mock surface reproduces Obsidian's API name for name, so every boolean here is named by Obsidian
       * rather than by us: the global `requireApiVersion`, `Array.prototype.contains`, `Object.each`,
       * `Node.prototype.instanceOf`, `MarkdownRenderer.supportWorker`, `MetadataCache.omitMdExtension`, and the
       * `_center` / `_system` / `_instant` / `resetTimer` parameters of `scrollIntoView`, `trash`, the slider
       * setter and `debounce`. Adding an `is`/`does` prefix to any of them would make the mock stop answering to
       * the name callers actually use, so the rule can never be satisfied on these files. Tests, scripts and
       * `src/internal/**` name their own booleans and keep the check.
       */
      files: [
        'src/obsidian/**/*.ts',
        'src/globals/**/*.ts'
      ],
      ignores: testFiles,
      rules: {
        'unicorn/consistent-boolean-name': 'off'
      }
    }
  ]);
}
