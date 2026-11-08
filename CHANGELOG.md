# CHANGELOG

## 7.3.0

This release has 1 new feature, 3 fixes and 2 documentation changes. 4 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### New

- track obsidian 1.14.4 and mock its new API surface

### Fixed

- **metadata-cache:** stop throwing on a tab between quote levels
- \[BUG\] Metadata parsing crashes on a quoted list inside a list item (#4)
- **scripts:** merge skipping prepare-script output above the npm pack JSON

### Documentation

- **changelog:** escape the issue-title tags so markdownlint and cspell pass
- **changelog:** name the issue each released entry resolved

## 7.2.3

This release has 1 fix. 6 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Fixed

- **normalizePath:** port Obsidian's root, NFC and no-break-space handling

## 7.2.2

This release has 1 new feature and 21 fixes.

### New

- **metadata-cache:** merge filling footnotes, footnoteRefs and referenceLinks

### Fixed

- **deps:** merge making CodeMirror and moment peers that follow obsidian
- **scripts:** merge reading vendored eslint rules from typescript-dev-toolkit
- **eslint:** merge linting vitest.config.ts
- **metadata-cache:** merge ending an item in a lazily opened blockquote
- **metadata-cache:** merge reading definitions inside containers
- **metadata-cache:** merge reading an inline block id after any inline token
- **metadata-cache:** merge reading tab list markers and whitespace lines in HTML blocks
- **metadata-cache:** merge reading a list marker that ends its line as an empty item
- **metadata-cache:** merge reading stacked list markers and ordered items after a quote
- **metadata-cache:** merge ending lists, math blocks and quoted items as Obsidian's worker does
- **metadata-cache:** merge closing the frontmatter block as Obsidian's worker does
- **metadata-cache:** merge reading headings, definitions, block ids and list lines as Obsidian's worker does
- **metadata-cache:** merge parenting, stripping and closing list items as Obsidian's worker does
- **metadata-cache:** merge ending the frontmatter block at its closing delimiter
- **metadata-cache:** merge reading the blocks between sections as Obsidian's worker does
- **metadata-cache:** merge hiding list items inside code blocks, comments and math blocks
- **metadata-cache:** merge parsing CRLF and lone-CR notes as Obsidian does
- **metadata-cache:** merge typing callout blocks as callout sections
- **metadata-cache:** merge list item ends measured against Obsidian
- **metadata-cache:** merge list items inside blockquotes
- **metadata-cache:** merge list grouping by intervening content

## 7.2.1

This release has 1 fix and 1 improvement.

### Fixed

- **metadata-cache:** merge list items starting at their container's content column

### Improved

- **metadata-cache:** merge linear-time list parent lookup (re #3 - \[BUG\] Quadratic parent lookup when parsing flat lists)

## 7.2.0

This release has 1 new feature and 2 fixes.

### New

- **platform:** merge Platform.canOpenExternalFiles

### Fixed

- **metadata-cache:** merge resolving link paths without regard to case
- **docs:** merge rendering GitHub alerts as Starlight asides again

## 7.1.0

This release has 1 new feature, 1 fix and 1 documentation change. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- merge the WorkspaceLeaf tab header model

### Fixed

- **file-system-adapter:** merge the rmdir file deletion

### Documentation

- merge the resolveLinks comment reword

## 7.0.0

This release has 1 breaking change, 2 fixes and 1 documentation change. 10 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Breaking changes

- **vault:** merge the root-first recurseChildren walk

### Fixed

- merge the Notice omitted-duration default
- merge getFrontMatterInfo trailing-newline port

### Documentation

- **changelog:** reword a shipped entry that named a private branch

## 6.1.0

This release has 1 new feature.

### New

- merge Plugins.manifests and a real Editor.cm

## 6.0.0

This release has 40 breaking changes, 6 new features, 5 fixes and 10 documentation changes. 18 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Breaking changes

- **markdown-parser:** merge the sequence-frontmatter fix
- **markdown-parser:** merge the empty-frontmatterLinks fix
- **value:** merge the Bases value rendering
- **markdown-parser:** merge the absent-frontmatter-cache fix
- **reg-exp-value:** merge the wrapped-pattern fix
- **value:** merge the Bases value type-name assignment
- **null-value:** merge the singleton and null-printing fix
- **tags:** merge the #-prefixed tag storage fix
- **frontmatter:** merge the aliases and entries fidelity fix
- **markdown-parser:** merge the broken-frontmatter catch
- **value:** merge the per-class equals and looseEquals fidelity fix
- **tags:** merge the tag-list subclass fix
- **markdown-parser:** merge the frontmatter-link fidelity fix
- **tags:** merge the tag-reading fidelity fix
- **markdown-parser:** merge the non-object frontmatter record fix
- **workspace-leaf:** merge the real leaf view and its view registry
- **settings:** merge the setClass split and mod-toggle fidelity fix
- **value:** merge the equals and looseEquals statics fidelity fix
- **file-value:** merge the five file-key accessors
- **file-manager:** merge the trashOption routing fidelity fix
- **workspace:** merge the empty-tab reuse fidelity fix
- **view:** merge the navigation and icon default fidelity fix
- **settings:** merge the tooltip target and setWarning fidelity fix
- **bases:** merge the list aggregations and the value icon, keys and objectAccess work
- **markdown-view:** merge the four-buffer delegation fix
- **editor:** merge the deleteLine and line-swap fidelity fix
- **vault:** merge the trash routing and .trash folder fidelity fix
- **settings:** disable the element, and build the row as Obsidian does
- **bases:** render a relative date relatively, and give ObjectValue its real lookups
- **markdown-view:** dispatch a minimal line diff on set, not a whole-document replace
- **editor:** map the selection through a change, restore it on undo and redo, and port processLines
- **vault:** clear a removed entry's parent, honour delete's force, and split the two adapters' rmdir and copy
- **node:** merge the insertAfter, setChildrenInPlace and empty fidelity fixes
- **mocks:** merge the debounce, search, heading, sanitizing, icon and event fidelity fixes
- **workspace:** merge the workspace layout tree, leaf event, Menu.hide and link text fixes
- **mocks:** merge the MenuItem, suggest, Events, PopoverState and QueryController fixes
- **settings:** merge the setting component change-callback and SettingGroup fidelity fixes
- **bases:** merge the DateValue, DurationValue, ListValue, FileValue and LinkValue fidelity fixes
- **editor:** merge the Editor position, word, transaction and setValue fidelity fixes
- **vault:** merge the folder delete, copy and create collision fidelity fixes

### New

- **setting:** implement setIcon and iconEl, and promote setRowClick and rowClick
- **platform:** merge mobileDeviceHeight and mobileKeyboardHeight
- **platform:** merge the five remaining can* getters
- **platform:** merge the ten remaining PlatformEx members
- **settings:** merge the addText Enter-blur affordance
- **metadata-cache:** merge the iterateRefsForFile walk

### Fixed

- **workspace:** merge the leaf-lifecycle fidelity fix
- **globals:** merge the receiver fix for onNodeInserted, onWindowMigrated and indexOf
- **eslint:** move the recursion suppression out of the shared rule source
- **scripts:** resolve local tool hops through the node_modules/.bin shim
- **scripts:** reconcile the shared helper copies across the sibling projects

### Documentation

- **lint:** state the unicorn arm's reason in a form that is true in every consumer
- **types:** record that an inlined shape is not retired by a typings release
- **agents:** correct the canOpenExternalFiles cross-reference
- record that the View base neither navigates nor carries an empty icon
- **eslint-rules:** state the real upstream and the two deltas a copy applies
- **eslint-config:** say why `no-console` is off over the script files
- **deps:** fix the js-yaml pin's check, and what it says about markdownlint-cli2
- replace the private rule-id citations with what they assert
- name the library and the sibling plugins so a reader can resolve them
- **agents:** say that the custom rule sources are shared copies, and what that forbids

## 5.2.0

This release has 2 fixes and 1 documentation change. 4 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Fixed

- **docs:** move the relative-link rewrite onto Sätteri, which docs:build has needed since Astro 7.3
- **scripts:** run the script hops through the detected package manager

### Documentation

- **scripts:** drop the private tracker ids from the npm-pack comments

## 5.1.0

This release has 1 fix. 2 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Fixed

- **metadata-cache:** setCache__ emits the changed event Obsidian actually emits

## 5.0.0

This release has 1 breaking change, 1 new feature and 2 fixes. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### Breaking changes

- **obsidian-typings:** implement Obsidian internals under their real names

### New

- **App:** mock Plugins so app.plugins.getPlugin() answers null

### Fixed

- **release:** parse npm pack --json under npm 12, so the release stops half-failing
- **build:** drop build:compile, a gate that skipped declaration validation

## 4.2.1

This release has 1 new feature and 1 fix. 2 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### New

- **version:** add --no-changelog-editing, so a release can run unattended

### Fixed

- **strict-proxy:** yield on the properties test tooling duck-types on

## 4.2.0

This release has 2 new features and 1 fix. 3 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### New

- **vault:** populate `TFile.stat` from the adapter
- **docs:** add Astro + Starlight documentation site

### Fixed

- **docs:** replace the obsidian-dev-utils favicon with an icon of this package's own

## 4.1.0

This release has 1 new feature. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- **modal:** model Obsidian's real modal DOM

## 4.0.0

This release has 1 breaking change. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### Breaking changes

- strict unicorn config

## 3.11.0

This release has 1 breaking change and 1 new feature.

### Breaking changes

- record separators in the Menu mock

### New

- **menu:** bridge Menu.items and Menu.setSectionSubmenu

## 3.10.1

This release has 1 fix.

### Fixed

- **markdown-parser:** locate every block of a multi-block gap at its own offset

## 3.10.0

This release has 2 new features. 2 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### New

- **SettingTab:** render declarative setting definitions the way Obsidian does
- **scripts:** add per-script env-var off switch

## 3.9.0

This release has 1 new feature.

### New

- **menu-item:** model the submenu surface

## 3.8.0

This release has 1 new feature. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- **vault:** model the attachment-path resolution surface

## 3.7.0

This release has 1 fix and 1 documentation change. 2 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Fixed

- **globals:** make Keymap and value-typed augmented members faithful

### Documentation

- update

## 3.6.0

This release has 1 new feature. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- model SuggestModal instruction bar

## 3.5.1

This release has 1 fix. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### Fixed

- **obsidian:** make markdown cache position end offsets exclusive

## 3.5.0

This release has 6 new features and 4 documentation changes.

### New

- **obsidian:** add Vault.reconcile__ to sync the tree from the adapter
- **obsidian-typings:** model MetadataCache fileCache and computeMetadataAsync
- **obsidian:** faithful synchronous MetadataCache indexing
- **obsidian:** createFolder creates and links intermediate ancestors
- **obsidian:** cascade descendant paths on folder rename
- **obsidian-typings:** getAvailablePath de-duplicates via existence check

### Documentation

- correct getAvailablePath stub description
- tighten MetadataCache gap with the two real editLinks frictions
- correct stale rule/module references and MetadataCache gap
- record modeling gaps that block consumer unit coverage

## 3.4.0

This release has 9 new features, 1 fix and 1 documentation change. 10 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### New

- **obsidian:** faithful DateValue.relative and DurationValue.parseFromString
- **obsidian:** mock remaining missing members across views and suggests Add the obsidian.d.ts members flagged by the conformance test
- **obsidian:** mock Plugin registration methods for conformance
- **obsidian:** adapter getFullPath/readLocalFile, PopoverState, __ renames
- **globals:** mock UIEvent augmentation members; fix global conformance targets
- **obsidian:** mock Bases value-type members for conformance
- **obsidian:** implement the obsidian 1.13.1 API delta in the mocks
- **scripts:** add linkinator and unify markdownlint.ts link-checking
- **scripts:** add isVerbose option to check-project-types

### Fixed

- **scripts:** make markdownlint schema Rule import type-only

### Documentation

- require matching latest obsidian.d.ts API on each release (L11)

## 3.3.0

This release has 1 new feature.

### New

- more bridges

## 3.2.0

This release has 4 new features. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- add no-unused-params-members ESLint rule
- expose AbstractInputSuggest.textInputEl via bridge
- **eslint:** enforce readonly Params/Options/Result members
- **eslint:** migrate recent obsidian-dev-utils eslint changes

## 3.1.1

This release has 1 new feature. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- replace patch-package with manual type validation

## 3.1.0

This release has 1 fix. 2 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Fixed

- refine Component

## 3.0.0

This release has 1 new feature.

### New

- add obsidian-typings bridges

## 2.0.4

This release has maintenance changes only. 2 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

## 2.0.3

This release has maintenance changes only. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

## 2.0.2

This release has 2 documentation changes. 2 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Documentation

- add CONTRIBUTING
- update README

## 2.0.1

This release has 1 fix.

### Fixed

- **build:** rewrite .ts extension in dynamic import() calls

## 2.0.0

This release has 1 breaking change.

### Breaking changes

- add support for jest

## 1.1.1

This release has 1 fix.

### Fixed

- build

## 1.1.0

This release has 1 new feature. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- bypassStrictProxy

## 1.0.11

This release has 1 fix. 3 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### Fixed

- nested createEl re #1

## 1.0.10

This release has 2 new features and 1 fix. 2 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### New

- make App.create... sync
- add local ESLint rule no-used-underscore-params

### Fixed

- tests

## 1.0.9

This release has 1 fix.

### Fixed

- declare types

## 1.0.8

This release has 2 new features. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### New

- expose fileMap__
- add fromOriginalType__()

## 1.0.7

This release has 1 new feature and 1 fix.

### New

- expose setVaultAbstractFile__and deleteVaultAbstractFile__ on Vault

### Fixed

- expose proper type

## 1.0.6

This release has maintenance changes only. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

## 1.0.5

This release has 2 fixes and 1 documentation change.

### Fixed

- batching for too many files
- generated types

### Documentation

- update README

## 1.0.4

This release has 1 fix. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### Fixed

- generated types

## 1.0.3

This release has 4 new features. 4 maintenance commits (tests, build, CI, refactoring, dependencies) are not listed.

### New

- generate and ship .d.mts/.d.cts type declarations
- implement WorkspaceLeaf.detach() and Workspace.openLinkText()
- implement Editor.exec() for all EditorCommandName commands
- implement sortSearchResults with score-based descending sort

## 1.0.2

This release has 1 documentation change. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### Documentation

- fix

## 1.0.1

This release has 1 documentation change. 1 maintenance commit (tests, build, CI, refactoring, dependencies) is not listed.

### Documentation

- cleanup

## 1.0.0

This release has 1 other change.

### Other changes

- Initial
