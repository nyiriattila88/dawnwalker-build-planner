import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Build } from '../build/build';
import type { Tree } from '../catalog/catalog';
import { createGameCatalog } from '../catalog/game-catalog';
import { TreeTabs } from './tree-tabs';

const catalog = createGameCatalog();

const renderTabs = (build: Build, onSelect: (tree: Tree) => void = () => undefined): void => {
  render(
    <TreeTabs
      trees={catalog.trees}
      current={catalog.tree('swordmastery')}
      build={build}
      onSelect={onSelect}
    />,
  );
};

describe('TreeTabs', () => {
  it('marks the tree on show and counts the skill points spent in each tree', () => {
    const build = new Build(catalog);
    build.addRank(catalog.perk('stinging-blade'));

    renderTabs(build);

    expect(
      screen
        .getAllByRole('button')
        .map((tab) => [tab.textContent, tab.getAttribute('aria-pressed')]),
    ).toEqual([
      ['Witchcraft0', 'false'],
      ['Swordmastery1', 'true'],
      ['Vampirism0', 'false'],
    ]);
    expect(screen.getByLabelText('1 skill point')).toBeInTheDocument();
  });

  it('shows the tree a click picks', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<(tree: Tree) => void>();
    renderTabs(new Build(catalog), onSelect);

    await user.click(screen.getByRole('button', { name: /^Vampirism/ }));

    expect(onSelect).toHaveBeenCalledWith(catalog.tree('vampirism'));
  });
});
