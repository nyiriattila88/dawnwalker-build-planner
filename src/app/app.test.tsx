import { render, screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Build } from '../build/build';
import { createBuildCodec } from '../build/build-code';
import { createGameCatalog } from '../catalog/game-catalog';
import { App } from './app';
import type { BuildAddress } from './build-address';

const catalog = createGameCatalog();
const codec = createBuildCodec(catalog);

// The code of the build an empty one becomes after the change.
const codeOf = (change: (build: Build) => void): string => {
  const build = new Build(catalog);
  change(build);
  return codec.encode(build);
};

const STINGING_BLADE = codeOf((build) => {
  build.addRank(catalog.perk('stinging-blade'));
});

// Every rank of every Swordmastery perk, far more than the 35 skill points its Ultimate Perks ask for.
const SWORDMASTERY_PERKS = codeOf((build) => {
  for (const perk of catalog.tree('swordmastery').perks) {
    perk.ranks.forEach(() => {
      build.addRank(perk);
    });
  }
});

type Planner = {
  readonly user: UserEvent;
  // Every build code the planner put into the address bar, null for an empty build.
  readonly shown: readonly (string | null)[];
};

// Opens the planner on an address bar kept in memory, the way the browser opens a page address.
const openPlanner = (code = ''): Planner => {
  const user = userEvent.setup();
  const shown: (string | null)[] = [];
  const address: BuildAddress = {
    code: () => code,
    linkTo: (shared) => `https://planner.test/${shared === null ? '' : `?build=${shared}`}`,
    show: (shared) => {
      shown.push(shared);
    },
  };
  render(<App catalog={catalog} codec={codec} address={address} />);
  return { user, shown };
};

const perkNode = (name: string, rank: number, ranks: number): HTMLElement =>
  screen.getByRole('button', { name: `${name}, rank ${rank} of ${ranks}` });

const ultimateNode = (name: string, state: 'learned' | 'not learned'): HTMLElement =>
  screen.getByRole('button', { name: `${name}, Ultimate Perk, ${state}` });

describe('App', () => {
  it('learns a rank on a click and puts the new build into the address', async () => {
    const { user, shown } = openPlanner();

    await user.click(perkNode('Stinging Blade', 0, 4));

    expect(perkNode('Stinging Blade', 1, 4)).toBeInTheDocument();
    expect(shown.at(-1)).toBe(STINGING_BLADE);
  });

  it('opens a perk only once the perk its line leads down from has a rank', async () => {
    const { user } = openPlanner();

    await user.click(perkNode("Fate's Favour", 0, 4));
    await user.click(perkNode('Stinging Blade', 0, 4));
    await user.click(perkNode("Fate's Favour", 0, 4));

    expect(perkNode("Fate's Favour", 1, 4)).toBeInTheDocument();
  });

  it('takes a rank back on a right-click', async () => {
    const { user } = openPlanner(STINGING_BLADE);

    await user.pointer({ keys: '[MouseRight]', target: perkNode('Stinging Blade', 1, 4) });

    expect(perkNode('Stinging Blade', 0, 4)).toBeInTheDocument();
  });

  it('shows the cost of every rank in the info panel and marks the estimated ones', async () => {
    const { user } = openPlanner();

    await user.hover(perkNode('Precision', 0, 3));

    const panel = screen.getByRole('complementary');
    expect(within(panel).getByRole('heading', { name: 'Precision' })).toBeInTheDocument();
    expect(within(panel).getAllByTitle(/^Estimated/)).toHaveLength(3);
    expect(
      within(panel).getByText("Learn Fate's Favour first to make it available."),
    ).toBeInTheDocument();
  });

  it('slots an ability picked for a wheel slot and offers it to the day quickslots', async () => {
    const { user } = openPlanner();
    await user.click(screen.getByRole('button', { name: 'Active Abilities' }));

    await user.click(screen.getByRole('button', { name: 'Swordmastery slot 1' }));
    await user.click(
      within(screen.getByRole('region', { name: 'Swordmastery slot 1' })).getByRole('button', {
        name: 'Dirty Trick',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Day quickslots, up' }));
    await user.click(
      within(screen.getByRole('region', { name: 'Day quickslots, up' })).getByRole('button', {
        name: 'Dirty Trick',
      }),
    );

    expect(
      screen.getByRole('button', { name: 'Dirty Trick in Swordmastery slot 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Dirty Trick in Day quickslots, up' }),
    ).toBeInTheDocument();
  });

  it('keeps the Ultimate Perks of a tree shut below 35 skill points', async () => {
    const { user } = openPlanner(STINGING_BLADE);

    await user.click(ultimateNode('Last Stand', 'not learned'));

    expect(ultimateNode('Last Stand', 'not learned')).toBeInTheDocument();
  });

  it('opens the Ultimate Perks of a tree at 35 skill points and keeps only the one taken', async () => {
    const { user } = openPlanner(SWORDMASTERY_PERKS);

    await user.click(ultimateNode('Last Stand', 'not learned'));
    await user.click(ultimateNode('Sword Sage', 'not learned'));

    expect(ultimateNode('Last Stand', 'learned')).toBeInTheDocument();
    expect(ultimateNode('Sword Sage', 'not learned')).toBeInTheDocument();
  });

  it('opens a link of 1.0 and puts the code of today for the same build into the address', () => {
    const { shown } = openPlanner('BK9vcpGz_wvW1KAS7GxPWNnxHAAAZefB0gAA');

    expect(perkNode('Stinging Blade', 2, 4)).toBeInTheDocument();
    expect(shown.at(-1)).toMatch(/^\./);
  });

  it('keeps an unreadable code in the address and says it could not be read', () => {
    // Spaces, because nearly every run of base64url letters is the code of some build.
    const { shown } = openPlanner('not a build code');

    expect(screen.getByRole('status')).toHaveTextContent(/could not be read/);
    expect(shown).toEqual([]);
  });

  it('empties the build and the address on Reset All', async () => {
    const { user, shown } = openPlanner(STINGING_BLADE);

    await user.click(screen.getByRole('button', { name: 'Reset All' }));

    expect(perkNode('Stinging Blade', 0, 4)).toBeInTheDocument();
    expect(shown.at(-1)).toBeNull();
  });
});
