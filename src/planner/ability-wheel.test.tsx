import { render, screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { useState, type JSX } from 'react';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { Build } from '../build/build';
import { createGameCatalog } from '../catalog/game-catalog';
import { AbilityWheel } from './ability-wheel';
import type { InfoTarget } from './info-target';

const catalog = createGameCatalog();

type WheelProps = {
  readonly start: Build;
  readonly onShow: (target: InfoTarget) => void;
};

// Holds the build the way the app does: every change is made on a copy.
function Wheel({ start, onShow }: WheelProps): JSX.Element {
  const [build, setBuild] = useState(start);
  return (
    <AbilityWheel
      catalog={catalog}
      build={build}
      onChange={(change) => {
        setBuild((current) => {
          const draft = current.clone();
          change(draft);
          return draft;
        });
      }}
      onShow={onShow}
    />
  );
}

type Screen = {
  readonly user: UserEvent;
  readonly onShow: Mock<(target: InfoTarget) => void>;
};

// Opens the Active Abilities screen on an empty build, changed first by whatever the test needs.
const openWheel = (prepare: (build: Build) => void = () => undefined): Screen => {
  const build = new Build(catalog);
  prepare(build);
  const user = userEvent.setup();
  const onShow = vi.fn<(target: InfoTarget) => void>();
  render(<Wheel start={build} onShow={onShow} />);
  return { user, onShow };
};

const button = (name: string): HTMLElement => screen.getByRole('button', { name });

// A slot keeps its button when what it holds changes, so a slot is found by the name it has now.
const slotHolding = (name: string): HTMLElement | null => screen.queryByRole('button', { name });

const inList = (name: string): HTMLElement =>
  within(screen.getByRole('region', { name: 'All abilities' })).getByRole('button', { name });

// The abilities a slot's list offers, without its Empty it and Close buttons.
const choices = (title: string): string[] =>
  within(screen.getByRole('region', { name: title }))
    .getAllByRole('button')
    .map((choice) => choice.textContent)
    .filter((name) => name !== 'Empty it' && name !== 'Close');

describe('AbilityWheel', () => {
  it('slots a learned ability from the list into the first free slot of its tree, and takes it off on a second click', async () => {
    const { user } = openWheel();

    await user.click(inList('Dirty Trick'));
    const slotted = slotHolding('Dirty Trick in Swordmastery slot 1');
    await user.click(inList('Dirty Trick'));

    expect(slotted).not.toBeNull();
    expect(slotHolding('Dirty Trick in Swordmastery slot 1')).toBeNull();
  });

  it('opens one more slot of a tree for each rank of its slot perk', () => {
    openWheel((build) => {
      build.addRank(catalog.perk('sustained-focus'));
      build.addRank(catalog.perk('master-fencer'));
    });

    expect(
      [1, 2, 3].map((index) => button(`Swordmastery slot ${index}`).hasAttribute('disabled')),
    ).toEqual([false, false, true]);
  });

  it('offers a slot the learned abilities that take one, and says what to learn when there is none', async () => {
    const { user } = openWheel();

    await user.click(button('Witchcraft slot 1'));
    const witchcraft = choices('Witchcraft slot 1');
    await user.click(button('Vampirism slot 1'));

    expect(witchcraft).toEqual(['Burning Blood']);
    expect(
      within(screen.getByRole('region', { name: 'Vampirism slot 1' })).getByText(
        'Learn a Vampirism ability first: click it on the character screen.',
      ),
    ).toBeInTheDocument();
  });

  it('empties a slot on a right-click and on Delete', async () => {
    const { user } = openWheel((build) => {
      build.slot(catalog.ability('dirty-trick'), 0);
    });

    await user.pointer({
      keys: '[MouseRight]',
      target: button('Dirty Trick in Swordmastery slot 1'),
    });
    const afterRightClick = screen.queryByRole('button', {
      name: 'Dirty Trick in Swordmastery slot 1',
    });
    await user.click(inList('Dirty Trick'));
    button('Dirty Trick in Swordmastery slot 1').focus();
    await user.keyboard('{Delete}');

    expect(afterRightClick).toBeNull();
    expect(button('Swordmastery slot 1')).toBeInTheDocument();
  });

  it('offers the night quickslots only the Swordmastery and Vampirism actives on the wheel', async () => {
    const { user } = openWheel((build) => {
      build.slot(catalog.ability('dirty-trick'), 0);
      build.slot(catalog.ability('burning-blood'), 0);
    });

    await user.click(button('Day quickslots, up'));
    const day = choices('Day quickslots, up');
    await user.click(button('Night quickslots, up'));
    const night = choices('Night quickslots, up');

    expect([[...day].sort(), night]).toEqual([['Burning Blood', 'Dirty Trick'], ['Dirty Trick']]);
  });

  it('puts a picked ability on a quickslot and empties it again from the list', async () => {
    const { user } = openWheel((build) => {
      build.slot(catalog.ability('dirty-trick'), 0);
    });

    await user.click(button('Day quickslots, left'));
    await user.click(
      within(screen.getByRole('region', { name: 'Day quickslots, left' })).getByRole('button', {
        name: 'Dirty Trick',
      }),
    );
    const picked = slotHolding('Dirty Trick in Day quickslots, left');
    await user.click(button('Dirty Trick in Day quickslots, left'));
    await user.click(button('Empty it'));

    expect(picked).not.toBeNull();
    expect(slotHolding('Dirty Trick in Day quickslots, left')).toBeNull();
  });

  it('counts one activation charge, and one more for the first rank of Sustained Focus', () => {
    openWheel((build) => {
      build.addRank(catalog.perk('sustained-focus'));
    });

    expect(screen.getByLabelText('2 activation charges')).toBeInTheDocument();
  });

  it('keeps the abilities that take no slot out of the slots and says why', () => {
    openWheel();

    const compelSoul = inList('Compel Soul');

    expect(compelSoul).toBeDisabled();
    expect(compelSoul).toHaveAttribute('title', 'Compel Soul takes no slot');
  });

  it('shows an ability in the info panel while the pointer is over it in the list', async () => {
    const { user, onShow } = openWheel();

    await user.hover(inList('Burning Blood'));

    expect(onShow).toHaveBeenLastCalledWith({
      kind: 'ability',
      ability: catalog.ability('burning-blood'),
    });
  });
});
