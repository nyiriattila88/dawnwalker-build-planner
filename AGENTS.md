# Instructions for AI agents

This file is for anyone changing this repository with an AI assistant or agent. The [README](README.md)
says what the planner is, [docs/architecture.md](docs/architecture.md) how it is built and run, and
[docs/data.md](docs/data.md) where the game data comes from and how sure it is. This file records what
has to be done after a change, and what is easy to break.

## Commands

```bash
pnpm install          # pnpm only, the version is pinned in package.json
pnpm dev              # http://localhost:5173/dawnwalker-build-planner/
pnpm check            # typecheck, type-aware ESLint, Prettier and knip
pnpm test             # Vitest, the tests sit next to the code they test
pnpm build            # the static site in dist/, what GitHub Pages serves
```

## How the code is split

Each layer only imports from the layers above it in this list. The model knows nothing about React.
ESLint checks both, so a wrong import fails `pnpm check`.

| Folder         | Role                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `src/data/`    | The game data: trees, perks, Ultimate Perks, abilities and the ability wheel. Plain values.    |
| `src/catalog/` | Joins the data into lookups and checks every reference once. Fails fast on a broken one.       |
| `src/build/`   | The `Build` model with every game rule, and the build code.                                    |
| `src/planner/` | React components and the pure UI logic beside them (geometry, the wheel's layout, asset URLs). |
| `src/app/`     | State, the address bar and the page layout: `useBuild`, `App`.                                 |
| `src/main.tsx` | The composition root: builds the catalog, codec and address and renders `App`.                 |

## What is easy to break

- **Build codes follow the data order.** A code walks the perks, abilities, ultimates, wheel slots and
  quickslots in the order of `src/data/` and the trees. Reordering or removing an entry silently
  changes what every shared code means, and so does changing an ability's `granted`, which sets the
  radix of its digit. New entries go at the end of their file. Today's codes start with `.`, and a
  code without it is read with the layout of 1.0 (`GRANTED_IN_1_0` in `src/build/build-code.ts`). A
  change that cannot keep today's codes needs another mark they cannot contain, such as `~`, with the
  older layouts still read. The pinned codes in `src/build/build-code.test.ts` guard this, never
  change them to make a test pass.
- **A perk comes after the perk it requires.** Decoding adds ranks in data order, so a parent must come
  first. The catalog refuses data that breaks this.
- **An estimate is never shown as the game's own number.** A rank's `cost.estimated` and a perk's
  `timingEstimated` say what was not read from the game. Only set one to `false` with the game's own
  screen as the source, and update the tables in docs/data.md.
- **The address is the only state.** The build lives in the `build` parameter of the page address
  (`src/app/build-address.ts`), nothing is stored in the browser.
- **Every rule lives in `Build`.** Components call its commands and never decide what is allowed. Every
  command leaves the build valid (`#normalize`), so a new rule goes into the model with a test, not
  into a component. Components get a `BuildView`, which leaves the commands out.
- **The tree pane keeps the game's pixels.** Positions are the centres of the nodes on a 1920 by 1080
  screenshot (`src/planner/geometry.ts`), and `FitToWidth` scales the pane down on a narrow screen.
- **Assets are served under the base path.** `public/images/` is referenced through
  `import.meta.env.BASE_URL` in `src/planner/asset-urls.ts`, because GitHub Pages serves the site under
  `/dawnwalker-build-planner/`. Icons are named after the ids in `src/data/`, so renaming an id loses
  its icon.

## Before you call a change done

```bash
pnpm check
pnpm test
pnpm build
```

A release raises the version in `package.json` and adds a `CHANGELOG.md` entry, the `/release` skill
walks through it. Pushing `main` only runs CI, the version goes live when its `v<version>` tag is pushed:
the Release workflow deploys it and publishes the GitHub release. The page footer shows the version and
the deployed commit, so what is live is never a guess.

## Language and style

- Code, comments and documentation are in English.
- No em dash anywhere, a plain hyphen instead: `git diff | grep -cP '\xe2\x80\x94'` must print 0.
- Named exports only, `type` rather than `interface`, no `utils` or `helpers` modules: a module is
  named after the one concept it holds.
- Tests are named for what, under which condition and what is expected, and follow arrange, act,
  assert.
- Commit messages are one line, at most 70 characters, with no AI attribution.
