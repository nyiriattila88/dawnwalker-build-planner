# The game data and how sure it is

The planner is only as good as its data, so this page says where every part of it comes from and
which parts are not yet read from the game itself.

## Where it comes from

| Data                                                   | Source                                                                                                  | Files                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Names, descriptions and the effect of every rank       | The game's own text, through the Gamer Guides database of perks                                         | `src/data/perks.ts`, `ultimates.ts`, `abilities.ts`        |
| Perk icons                                             | The same database, which holds the game's `t_icon_perk_*` icons                                         | `public/images/perks/`                                     |
| Ability icons                                          | Cut from screenshots of the character screen and photos of the Active Abilities screen, as white glyphs | `public/images/abilities/`                                 |
| Tree layout: node positions and the lines between them | Screenshots of the character screen (Gamer Guides, Mobalytics, photos of the game)                      | `position` and `requires` in `src/data/perks.ts`           |
| The ability wheel: slots, charges, quickslots          | The perks' own text and a photo of the Active Abilities screen                                          | `src/data/ability-wheel.ts`, `src/planner/wheel-layout.ts` |

The three data files were generated once from that material and are edited by hand from now on.
Their order is the order build codes walk, so an entry is never moved or removed (see AGENTS.md).

## What is read and what is estimated

The game shows what a rank costs only while it is still to learn. Read from the game so far:

| Perk                                           | Ranks | Skill points        | Time segments       |
| ---------------------------------------------- | ----- | ------------------- | ------------------- |
| Vigour, Endless Effort                         | 4     | ranks 3 and 4: 1, 2 | ranks 3 and 4: 1, 1 |
| Witchcraft Mastery                             | 4     | 1, 1, 1, 2          | 1, 1, 1, 1          |
| Dimension Reach                                | 3     | 1, 1, 2             | 1, 1, 1             |
| Unnatural Resilience                           | 2     | rank 2: 1           | rank 2: 1           |
| Forager                                        | 2     | 1, 1                | 1, 1                |
| Every Ultimate Perk (read on Sanguine Renewal) | 1     | 4                   | 2                   |

Every other rank follows that pattern and is marked `estimated: true`, shown as ≈ on the page: one
skill point per rank and two for the last rank of a three or four rank perk, one time segment per
rank. The first two ranks of Endless Effort, Vigour, Stinging Blade and Omniblock, and Mercurial
Fervour and Shapeshift, are reported to cost no time. No ability cost has been read yet.

When a perk's day or night label was not read from its info panel, it is inferred from its tree and
its description (`timingEstimated: true`): Swordmastery anytime, Vampirism night only, Witchcraft day
only, except the gathering, crafting and trade perks, which apply anytime.

Some abilities were placed on their tree's grid by their icon and frame rather than by the name the
game shows for that cell (`cellEstimated: true`): Broad Swing, Walking Fortress, Swiftness, Adrenaline
Rush, Soul Reaping, Life Lock, Shadowstorm, Piercing Shriek and Death from Above.

Two rules are assumptions: the 35 skill points an ultimate asks for count abilities as well as perks,
and an ability needs no other ability first.

## Making an estimate exact

Select the perk or ability in the game while it still has ranks to learn and read the info panel: each
rank shows its skill points and time segments. Put the numbers into the rank's `cost` and set its
`estimated` to `false`. The pinned codes in `src/build/build-code.test.ts` do not depend on costs, so
they stay as they are.
