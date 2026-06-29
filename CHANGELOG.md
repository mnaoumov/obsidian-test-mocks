# CHANGELOG

## 3.4.0

- feat(obsidian): faithful DateValue.relative and DurationValue.parseFromString
- refactor(obsidian): suffix PluginSettingTab.plugin as plugin__
- feat(obsidian): mock remaining missing members across views and suggests Add the obsidian.d.ts members flagged by the conformance test
- feat(obsidian): mock Plugin registration methods for conformance
- feat(obsidian): adapter getFullPath/readLocalFile, PopoverState, __ renames
- feat(globals): mock UIEvent augmentation members; fix global conformance targets
- refactor(obsidian): use \_IN\_ form for DurationValue time constants
- refactor(obsidian): spell out Milliseconds in DurationValue constants
- feat(obsidian): mock Bases value-type members for conformance
- test(obsidian): add an automated obsidian.d.ts conformance test
- chore: record obsidian 1.13.1 as the API baseline
- feat(obsidian): implement the obsidian 1.13.1 API delta in the mocks
- refactor(eslint): adopt obsidian-dev-utils baseline for custom rules
- refactor(scripts): make format.ts helper self-contained
- feat(scripts): add linkinator and unify markdownlint.ts link-checking
- docs: require matching latest obsidian.d.ts API on each release (L11)
- refactor(scripts): import process explicitly in spellcheck
- feat(scripts): add isVerbose option to check-project-types
- fix(scripts): make markdownlint schema Rule import type-only
- chore: read .env and honor NANO_STAGED opt-out in nano-staged config
- chore: update libs

## 3.3.0

- feat: more bridges

## 3.2.0

- chore: normalize TypeScript lib casing to ES2022
- feat: add no-unused-params-members ESLint rule
- feat: expose AbstractInputSuggest.textInputEl via bridge
- feat(eslint): enforce readonly Params/Options/Result members
- feat(eslint): migrate recent obsidian-dev-utils eslint changes

## 3.1.1

- chore: remove patches
- feat: replace patch-package with manual type validation

## 3.1.0

- refactor: introduce castTo\<T\> type-bridging helper
- test: cover createDiv non-div guard
- fix: refine Component

## 3.0.0

- feat: add obsidian-typings bridges

## 2.0.4

- chore: update libs
- refactor: migrate to @obsidian-typings/obsidian-public-latest

## 2.0.3

- chore: update libs

## 2.0.2

- docs: add CONTRIBUTING
- chore: add attestation
- refactor: noop
- docs: update README

## 2.0.1

- fix(build): rewrite .ts extension in dynamic import() calls

## 2.0.0

- feat!: add support for jest

## 1.1.1

- fix: build

## 1.1.0

- chore: set rootDir
- feat: bypassStrictProxy

## 1.0.11

- fix: nested createEl re #1
- refactor: simplify
- chore: allow magic numbers in tests
- chore: update issue templates

## 1.0.10

- fix: tests
- chore: improve as checks
- refactor: rename globals entry point to setup
- feat: make App.create... sync
- feat: add local ESLint rule no-used-underscore-params

## 1.0.9

- fix: declare types

## 1.0.8

- feat: expose fileMap__
- test: restore 100% coverage
- feat: add fromOriginalType__()

## 1.0.7

- fix: expose proper type
- feat: expose setVaultAbstractFile__and deleteVaultAbstractFile__ on Vault

## 1.0.6

- refactor: stop re-exporting non-mocked types

## 1.0.5

- fix: batching for too many files
- fix: generated types
- docs: update README

## 1.0.4

- test: add 100% test coverage
- fix: generated types

## 1.0.3

- refactor: remove unnecessary _ prefix from private fields
- refactor: use resolution-mode re-exports for ESM type
- refactor: wrap build-types.ts execution in main()
- feat: generate and ship .d.mts/.d.cts type declarations
- refactor: remove _ prefix from private fields
- feat: implement WorkspaceLeaf.detach() and Workspace.openLinkText()
- feat: implement Editor.exec() for all EditorCommandName commands
- feat: implement sortSearchResults with score-based descending sort

## 1.0.2

- chore: fix lib extensions
- docs: fix

## 1.0.1

- chore: add postinstall
- docs: cleanup

## 1.0.0

- Initial
