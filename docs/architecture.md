# How the planner is built

A static single page application: React 19, TypeScript in strict mode, Vite, Vitest and Testing
Library, served by GitHub Pages. There is no server and nothing is stored in the browser: the build
lives in the page address.

## Layers

The game rules know nothing about React. Each layer only imports from the layers above it, and ESLint
checks both (`import-x/no-restricted-paths` and `no-restricted-imports` in `eslint.config.js`):

| Layer          | What it holds                                                                      |
| -------------- | ---------------------------------------------------------------------------------- |
| `src/data/`    | The game data as plain typed values: trees, perks, ultimates, abilities, the wheel |
| `src/catalog/` | The data joined into lookups, with every reference resolved and checked            |
| `src/build/`   | The `Build` model with every game rule, and the build code                         |
| `src/planner/` | React components and the pure UI logic beside them                                 |
| `src/app/`     | State, the address bar and the page layout                                         |

`src/main.tsx` is the composition root: it creates the catalog, the build codec and the browser address
once and hands them to `App`.

## The catalog fails fast

`createCatalog` resolves every perk's `requires` to the perk object, checks that it stays in its tree,
that no perk requires itself through a chain, that a parent comes before its children in data order,
that each tree's slot perk sits in that tree, and that no two abilities share a cell of the grid. A
broken reference stops the page from opening instead of showing a tree that cannot be built. Lookups
by id are total: `catalog.perk(id)` throws on an unknown id, which the `PerkId` type already rules out.

## The rules live in `Build`

`Build` holds the perk and ability ranks, one Ultimate Perk per tree, the abilities on the wheel and
the two quickslot sets. Commands change it and return nothing, queries read it and change nothing.
Every command ends in `#normalize`, which takes back whatever the change left without its requirement:
the perks below a perk that lost its first rank, an ultimate whose tree's perks fell under 35 points, an
ability in a slot the tree no longer has, a quickslot whose ability left the wheel. So a build is valid
after every command, and no component has to know a rule.

React only ever sees a new build: `useBuild` runs a change on a clone (`apply(draft => ...)`), and
components get a `BuildView`, a type that leaves the commands out, so the build held in state cannot be
changed by mistake.

## The build code

A build is written as one number in mixed radix: every field is a digit with a radix of its own (a
perk's ranks plus one, a tree's ultimates plus one, the abilities a slot can take plus one) and the
code is that number in base64url. Decoding rebuilds the build through the commands of `Build` and
accepts only a code that the result writes back unchanged, so every build has exactly one code and
every accepted code exactly one build. Ranks come before the ultimates, whose requirement counts them,
and the wheel before the quickslots, which only take what is on it.

Since 1.0.2 a code starts with `.`, which base64url lacks. A code without it was written by 1.0, which
took Mercurial Fervour's first rank as granted: it is read with the layout of 1.0 and keeps the ranks
it bought, and the address bar then shows the build's code in today's form.

## The two screens

The **character screen** draws a tree in the pixels of a 1920 by 1080 screenshot of the game: the
positions in the data are the centres of the nodes, the lines run down from a parent to its child's row
and then across, as the game draws them, and `FitToWidth` scales the pane down on a narrow screen. The
info panel beside it reads like the game's: the day or night label, the name, the description and every
rank with its cost, with ≈ on what is estimated.

The **Active Abilities screen** places each tree's four slots on an arc of the wheel at the angles
measured on the game's screen (`src/planner/wheel-layout.ts`), with the abilities that need no slot
along the bottom, the activation charges in the middle and the two sets of directional quickslots
beside it. A click on a slot opens the list of what it can take.

## Tests and checks

Vitest runs the tests next to the code they test. The rules of `Build`, the catalog's checks and the
build code with pinned codes and random round trips run in Node. The component tests (`*.test.tsx`) run
in jsdom with Testing Library and find elements by role and accessible name, the way a screen reader
does. They render `App` with the real catalog and codec and an address bar kept in memory, and the
parts that have behaviour of their own on their own: the ability wheel, the share panel, the tree tabs,
the info panel and the controls of a node, taps on a touch screen included. That a `BuildView` has
none of the commands is checked by the type check (`src/build/build-view.test.ts`). `pnpm check` runs
the type check, type-aware ESLint (typescript-eslint `strictTypeChecked`), Prettier and knip.

## Deployment and releases

`.github/workflows/ci.yml` checks, tests and builds every push and pull request.
`.github/workflows/release.yml` runs when a `v*.*.*` tag is pushed: it checks the tag against
`package.json` and `CHANGELOG.md`, runs CI, deploys the build to GitHub Pages and publishes a GitHub
release with that version's CHANGELOG section. The page footer shows the version, the commit and the
build date, so what is live can always be checked.

## Running it locally

```bash
pnpm install
pnpm dev        # http://localhost:5173/dawnwalker-build-planner/
```
