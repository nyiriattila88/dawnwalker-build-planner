import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Build } from '../build/build';
import { createGameCatalog } from '../catalog/game-catalog';
import { InfoPanel } from './info-panel';
import type { InfoTarget } from './info-target';

const catalog = createGameCatalog();

const renderInfo = (
  target: InfoTarget,
  prepare: (build: Build) => void = () => undefined,
): void => {
  const build = new Build(catalog);
  prepare(build);
  render(<InfoPanel target={target} build={build} tree={(id) => catalog.tree(id)} />);
};

const mercurialFervour = catalog.ability('mercurial-fervour');

describe('InfoPanel', () => {
  it('says how an ability that takes no slot works and asks for its manual while ranks remain', () => {
    renderInfo({ kind: 'ability', ability: mercurialFervour });

    expect(
      screen.getByText('Takes no slot on the ability wheel: it works once learned.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Find or buy its manual to make it available.')).toBeInTheDocument();
  });

  it('drops the manual from an ability once every rank is learned', () => {
    renderInfo({ kind: 'ability', ability: mercurialFervour }, (build) => {
      mercurialFervour.ranks.forEach(() => {
        build.addAbilityRank(mercurialFervour);
      });
    });

    expect(screen.queryByText('Find or buy its manual to make it available.')).toBeNull();
  });

  it('counts the skill points a Swordmastery Ultimate Perk still waits for', () => {
    renderInfo({ kind: 'ultimate', ultimate: catalog.ultimate('last-stand') }, (build) => {
      build.addRank(catalog.perk('stinging-blade'));
    });

    expect(
      screen.getByText('Spend 35 skill points in Swordmastery to unlock: 1/35.'),
    ).toBeInTheDocument();
  });

  it('says a Vampirism Ultimate Perk opens with Corruption, which the game does not count out', () => {
    renderInfo({ kind: 'ultimate', ultimate: catalog.ultimate('sanguine-renewal') });

    expect(
      screen.getByText(
        'Opens with Corruption, which feeding raises. The game does not show the level it needs.',
      ),
    ).toBeInTheDocument();
  });

  it('marks only the rank costs that were not read from the game as estimated', () => {
    renderInfo({ kind: 'perk', perk: catalog.perk('vrakhiri-might') });

    expect(screen.getAllByTitle(/^Estimated/)).toHaveLength(1);
  });
});
