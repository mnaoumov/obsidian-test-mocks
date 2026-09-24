# CHANGELOG

## 6.1.0

- feat: merge Plugins.manifests and a real Editor.cm

## 6.0.0

- chore(copy-sync): read both gates' subject from the git index, not the working tree
- chore(copy-sync): take upstream's `../.astro/types.d.ts`, and roster `docs/tsconfig.json`
- chore(copy-sync): extend the shape gate to astro.config.ts, docs/src and build-pages.yml
- chore(docs-gen): gate the copy-sync tree by the shape of each file's diff against upstream
- chore(docs-gen): re-sync with obsidian-dev-utils after its unicorn 75 adoption
- chore(lint): record the deliberate ESLint-config divergences, and adopt one that was not
- docs(lint): state the unicorn arm's reason in a form that is true in every consumer
- chore(lint): gate the vendored rule sources against upstream, and re-sync three
- docs(types): record that an inlined shape is not retired by a typings release
- chore: update libs
- docs(agents): correct the canOpenExternalFiles cross-reference
- feat(setting): implement setIcon and iconEl, and promote setRowClick and rowClick
- feat(platform): merge mobileDeviceHeight and mobileKeyboardHeight
- feat(platform): merge the five remaining can* getters
- feat(platform): merge the ten remaining PlatformEx members
- fix(markdown-parser)!: merge the sequence-frontmatter fix
- fix(markdown-parser)!: merge the empty-frontmatterLinks fix
- fix(value)!: merge the Bases value rendering
- fix(markdown-parser)!: merge the absent-frontmatter-cache fix
- fix(reg-exp-value)!: merge the wrapped-pattern fix
- fix(value)!: merge the Bases value type-name assignment
- fix(null-value)!: merge the singleton and null-printing fix
- fix(tags)!: merge the #-prefixed tag storage fix
- fix(frontmatter)!: merge the aliases and entries fidelity fix
- fix(markdown-parser)!: merge the broken-frontmatter catch
- feat(settings): merge the addText Enter-blur affordance
- fix(value)!: merge the per-class equals and looseEquals fidelity fix
- feat(metadata-cache): merge the iterateRefsForFile walk
- fix(tags)!: merge the tag-list subclass fix
- fix(markdown-parser)!: merge the frontmatter-link fidelity fix
- fix(tags)!: merge the tag-reading fidelity fix
- fix(markdown-parser)!: merge the non-object frontmatter record fix
- feat(workspace-leaf)!: merge the real leaf view and its view registry
- fix(settings)!: merge the setClass split and mod-toggle fidelity fix
- fix(value)!: merge the equals and looseEquals statics fidelity fix
- feat(file-value)!: merge the five file-key accessors
- fix(file-manager)!: merge the trashOption routing fidelity fix
- fix(workspace)!: merge the empty-tab reuse fidelity fix
- docs: record that the View base neither navigates nor carries an empty icon
- fix(view)!: merge the navigation and icon default fidelity fix
- fix(settings)!: merge the tooltip target and setWarning fidelity fix
- feat(bases)!: merge the list aggregations and the value icon, keys and objectAccess work
- fix(markdown-view)!: merge the four-buffer delegation fix
- fix(editor)!: merge the deleteLine and line-swap fidelity fix
- fix(vault)!: merge the trash routing and .trash folder fidelity fix
- fix(workspace): merge the leaf-lifecycle fidelity fix
- fix(settings)!: disable the element, and build the row as Obsidian does
- fix(bases)!: render a relative date relatively, and give ObjectValue its real lookups
- fix(markdown-view)!: dispatch a minimal line diff on set, not a whole-document replace
- fix(editor)!: map the selection through a change, restore it on undo and redo, and port processLines
- fix(vault)!: clear a removed entry's parent, honour delete's force, and split the two adapters' rmdir and copy
- fix(node)!: merge the insertAfter, setChildrenInPlace and empty fidelity fixes
- fix(mocks)!: merge the debounce, search, heading, sanitizing, icon and event fidelity fixes
- fix(workspace)!: merge the workspace layout tree, leaf event, Menu.hide and link text fixes
- fix(mocks)!: merge the MenuItem, suggest, Events, PopoverState and QueryController fixes
- fix(settings)!: merge the setting component change-callback and SettingGroup fidelity fixes
- fix(bases)!: merge the DateValue, DurationValue, ListValue, FileValue and LinkValue fidelity fixes
- fix(editor)!: merge the Editor position, word, transaction and setValue fidelity fixes
- fix(vault)!: merge the folder delete, copy and create collision fidelity fixes
- fix(globals): merge the receiver fix for onNodeInserted, onWindowMigrated and indexOf
- chore: merge the TSDoc requirement on every exported member
- chore: merge the adoption of the unicorn 75 recommended rules
- chore(nano-staged): lint staged .astro files before a commit
- chore: update libs
- style(comments): restore a camelCase symbol that opens a comment
- docs(eslint-rules): state the real upstream and the two deltas a copy applies
- chore: update libs
- docs(eslint-config): say why `no-console` is off over the script files
- chore(deps): drop the dead glob and test-exclude overrides
- docs(deps): fix the js-yaml pin's check, and what it says about markdownlint-cli2
- style(comments): stop capitalizing the middle of a wrapped comment
- chore(deps): drop the dead markdown-it override
- docs: replace the private rule-id citations with what they assert
- docs: name the library and the sibling plugins so a reader can resolve them
- docs(agents): say that the custom rule sources are shared copies, and what that forbids
- fix(eslint): move the recursion suppression out of the shared rule source
- fix(scripts): resolve local tool hops through the node_modules/.bin shim
- chore(spellcheck): teach cspell the word lintable
- fix(scripts): reconcile the shared helper copies across the sibling projects

## 5.2.0

- test(vitest): give both projects a shared testTimeout, off the 5s default
- docs(scripts): drop the private tracker ids from the npm-pack comments
- test(vitest): give the scripts tests their own node project
- fix(docs): move the relative-link rewrite onto Sätteri, which docs:build has needed since Astro 7.3
- chore(deps): bump to latest, and clear the js-yaml and smol-toml advisories with overrides
- fix(scripts): run the script hops through the detected package manager
- chore: make the LICENSE copyright line lintable and guard it against the year roll-over

## 5.1.0

- chore(lint): retire the conformance-test Node-builtins waivers
- fix(metadata-cache): setCache__ emits the changed event Obsidian actually emits
- chore(deps): bump to latest, and clear the fflate advisory with a 0.7.5 override

## 5.0.0

- refactor(build): rename build:compile:typescript to build:compile
- fix(release): parse npm pack --json under npm 12, so the release stops half-failing
- feat(App): mock Plugins so app.plugins.getPlugin() answers null
- fix(build): drop build:compile, a gate that skipped declaration validation
- feat(obsidian-typings)!: implement Obsidian internals under their real names

## 4.2.1

- feat(version): add --no-changelog-editing, so a release can run unattended
- fix(strict-proxy): yield on the properties test tooling duck-types on
- chore: update libs
- ci: publish the release tarball by path, not as a git shorthand

## 4.2.0

- feat(vault): populate `TFile.stat` from the adapter
- ci: publish to npm via trusted publishing instead of a local NPM_TOKEN
- chore: update libs
- fix(docs): replace the obsidian-dev-utils favicon with an icon of this package's own
- feat(docs): add Astro + Starlight documentation site
- chore: update libs

## 4.1.0

- feat(modal): model Obsidian's real modal DOM
- chore: update libs

## 4.0.0

- chore!: strict unicorn config
- chore: update libs

## 3.11.0

- feat!: record separators in the Menu mock
- feat(menu): bridge Menu.items and Menu.setSectionSubmenu

## 3.10.1

- fix(markdown-parser): locate every block of a multi-block gap at its own offset

## 3.10.0

- feat(SettingTab): render declarative setting definitions the way Obsidian does
- feat(scripts): add per-script env-var off switch
- chore: update libs and clear the npm audit
- test(node-setup): pin the doc getter's global-document fallback

## 3.9.0

- feat(menu-item): model the submenu surface

## 3.8.0

- feat(vault): model the attachment-path resolution surface
- chore: update libs

## 3.7.0

- fix(globals): make Keymap and value-typed augmented members faithful
- docs: update
- build: pin the dev Node version to 26 via .nvmrc
- build: lock typescript to 6.0.3

## 3.6.0

- feat: model SuggestModal instruction bar
- chore: update libs

## 3.5.1

- fix(obsidian): make markdown cache position end offsets exclusive
- refactor: keep only first line of each commit in changelog

## 3.5.0

- feat(obsidian): add Vault.reconcile__ to sync the tree from the adapter
- feat(obsidian-typings): model MetadataCache fileCache and computeMetadataAsync
- feat(obsidian): faithful synchronous MetadataCache indexing
- feat(obsidian): createFolder creates and links intermediate ancestors
- feat(obsidian): cascade descendant paths on folder rename
- feat(obsidian-typings): getAvailablePath de-duplicates via existence check
- docs: correct getAvailablePath stub description
- docs: tighten MetadataCache gap with the two real editLinks frictions
- docs: correct stale rule/module references and MetadataCache gap
- docs: record modeling gaps that block consumer unit coverage

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
