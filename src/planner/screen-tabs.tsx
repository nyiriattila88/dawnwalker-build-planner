import type { JSX } from 'react';
import type { BuildView } from '../build/build';
import { SkillPointIcon, TimeIcon } from './cost-icons';

export type Screen = 'character' | 'abilities';

type ScreenTabsProps = {
  readonly screen: Screen;
  readonly build: BuildView;
  readonly onSelect: (screen: Screen) => void;
};

const SCREENS: readonly (readonly [Screen, string])[] = [
  ['character', 'Character'],
  ['abilities', 'Active Abilities'],
];

// The game's top bar: the two screens a build is planned on, and what the build has spent.
export function ScreenTabs({ screen, build, onSelect }: ScreenTabsProps): JSX.Element {
  const spent = build.spending();
  return (
    <nav className="screen-tabs" aria-label="Screens">
      {SCREENS.map(([id, name]) => (
        <button
          key={id}
          type="button"
          className={id === screen ? 'screen-tab active' : 'screen-tab'}
          aria-pressed={id === screen}
          onClick={() => {
            onSelect(id);
          }}
        >
          {name}
        </button>
      ))}
      <span
        className="spent"
        title={
          spent.estimated ? 'Some of these costs are estimated, see the ranks marked ≈' : undefined
        }
      >
        {spent.estimated && <span className="estimate-mark">≈</span>}
        <span>
          <SkillPointIcon /> {spent.skillPoints}
        </span>
        <span>
          <TimeIcon /> {spent.time}
        </span>
      </span>
    </nav>
  );
}
