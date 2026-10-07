# The game data and how sure it is

The planner is only as good as its data, so this page says where every part of it comes from and
which parts are not yet read from the game itself.

## Where it comes from

| Data                                                   | Source                                                                                                                                                                         | Files                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Names, descriptions and the effect of every rank       | The game's own text, through the Gamer Guides database of perks                                                                                                                | `src/data/perks.ts`, `ultimates.ts`, `abilities.ts`        |
| Perk icons                                             | The same database, which holds the game's `t_icon_perk_*` icons                                                                                                                | `public/images/perks/`                                     |
| Ability icons                                          | The game's own `T_Icon_AA_*` textures as MetaBot.GG publishes them, and Soul Reaping, which it lacks, cut from a lossless screenshot of the character screen in the same style | `public/images/abilities/`                                 |
| Tree emblems                                           | Cut from the tab row of lossless screenshots of the character screen, as white signs                                                                                           | `public/images/trees/`                                     |
| The engraving behind the trees                         | Three lossless screenshots of the character screen, one per tree: the game shows one picture behind every tree, and each pixel comes from a screenshot where no node hides it  | `public/images/character-background.webp`                  |
| Page icon                                              | Drawn after the sun and moon brooch of the game, the emblem of the Peregrini Aurorae                                                                                           | `public/images/favicon.svg` and the PNGs beside it         |
| Tree layout: node positions and the lines between them | Screenshots of the character screen (Gamer Guides, Mobalytics, photos of the game)                                                                                             | `position` and `requires` in `src/data/perks.ts`           |
| The ability wheel: slots, charges, quickslots          | The perks' own text and a photo of the Active Abilities screen                                                                                                                 | `src/data/ability-wheel.ts`, `src/planner/wheel-layout.ts` |

The three data files were generated once from that material and are edited by hand from now on.
Their order is the order build codes walk, so an entry is never moved or removed (see AGENTS.md).

## What is read and what is estimated

The game shows what a rank costs only while it is still to learn. Read from the game so far:

| Perk                                           | Ranks | Skill points        | Time segments       |
| ---------------------------------------------- | ----- | ------------------- | ------------------- |
| Vigour, Endless Effort                         | 4     | ranks 3 and 4: 1, 2 | ranks 3 and 4: 1, 1 |
| Witchcraft Mastery                             | 4     | 1, 1, 1, 2          | 1, 1, 1, 1          |
| Dimension Reach                                | 3     | 1, 1, 2             | 1, 1, 1             |
| Vrakhiri Might                                 | 3     | ranks 2 and 3: 1, 2 | ranks 2 and 3: 1, 1 |
| Sustained Focus                                | 4     | ranks 3 and 4: 1, 2 | ranks 3 and 4: 1, 1 |
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

Every ability sits in the cell of its tree's grid that shows its icon: the game names its ability
textures after the ability (`T_Icon_AA_SoulStigma`), and each texture was matched to a cell of a
screenshot of the character screen. The emblems on the abilities' manuals agree, and Soul Reaping, the
one without a texture, takes the last free cell, where its manual's emblem is drawn.

Five abilities start with their first rank, as the story grants it: Compel Soul, Astral Communion,
Burning Blood, Dirty Trick and Voracious Bite. This was checked in the game, where Mercurial Fervour has
to be learned like any other rank.

The 35 skill points an Ultimate Perk of Swordmastery or Witchcraft asks for count only the perks of
its tree, not the abilities: this was checked in the game. One rule is an assumption: an ability needs
no other ability first.

## Making an estimate exact

Select the perk or ability in the game while it still has ranks to learn and read the info panel: each
rank shows its skill points and time segments. Put the numbers into the rank's `cost` and set its
`estimated` to `false`. The pinned codes in `src/build/build-code.test.ts` do not depend on costs, so
they stay as they are.
