import type { JSX } from 'react';
import type { Build, BuildView } from '../build/build';
import type { Tree } from '../catalog/catalog';
import { AbilityNode } from './ability-node';
import { characterBackgroundUrl } from './asset-urls';
import { SkillPointIcon } from './cost-icons';
import { ABILITY_GRID, LABELS, toView, TREE_VIEW } from './geometry';
import { sameTarget, type InfoTarget } from './info-target';
import { PerkNode } from './perk-node';
import { TreeLinks } from './tree-links';
import { UltimateNode } from './ultimate-node';

type TreePaneProps = {
  readonly tree: Tree;
  readonly build: BuildView;
  readonly target: InfoTarget;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly onShow: (target: InfoTarget) => void;
};

const place = (point: readonly [number, number]) => {
  const [left, top] = toView(point);
  return { left, top };
};

// One tree of the character screen: the perks with their lines, the Ultimate Perks below them and
// the abilities on the right, laid out in the game's own pixels.
export function TreePane({ tree, build, target, onChange, onShow }: TreePaneProps): JSX.Element {
  const remaining = build.pointsToUltimate(tree.id);
  const needed = tree.ultimatePoints;
  const rows = Math.max(...tree.abilities.map((ability) => ability.cell[1])) + 1;
  return (
    <div
      className={`tree-pane tree-${tree.id}`}
      style={{ width: TREE_VIEW.width, height: TREE_VIEW.height }}
    >
      <div
        className="pane-art"
        aria-hidden="true"
        style={{ backgroundImage: `url("${characterBackgroundUrl}")` }}
      />
      <span className="pane-label" style={place(LABELS.perks)}>
        Perks
      </span>
      <span className="pane-label" style={place(LABELS.abilities)}>
        Abilities
      </span>
      <TreeLinks tree={tree} build={build} />
      {tree.perks.map((perk) => (
        <PerkNode
          key={perk.id}
          perk={perk}
          build={build}
          selected={sameTarget(target, { kind: 'perk', perk })}
          onGive={() => {
            onChange((draft) => {
              draft.addRank(perk);
            });
            onShow({ kind: 'perk', perk });
          }}
          onTakeBack={() => {
            onChange((draft) => {
              draft.removeRank(perk);
            });
            onShow({ kind: 'perk', perk });
          }}
          onShow={() => {
            onShow({ kind: 'perk', perk });
          }}
        />
      ))}
      <div className="ultimates-head" style={place(LABELS.ultimates)}>
        <span>
          <span className="ultimates-title">Ultimate Perks</span>{' '}
          <small>(only one can be unlocked per Skill Tree)</small>
        </span>
        {needed !== null && remaining > 0 && build.ultimate(tree.id) === null && (
          <span className="ultimate-spend">
            Spend <SkillPointIcon /> to unlock: {needed - remaining}/{needed}
          </span>
        )}
      </div>
      {tree.ultimates.map((ultimate) => (
        <UltimateNode
          key={ultimate.id}
          ultimate={ultimate}
          build={build}
          selected={sameTarget(target, { kind: 'ultimate', ultimate })}
          onTake={() => {
            onChange((draft) => {
              draft.takeUltimate(ultimate);
            });
            onShow({ kind: 'ultimate', ultimate });
          }}
          onDrop={() => {
            onChange((draft) => {
              if (draft.ultimate(tree.id)?.id === ultimate.id) draft.dropUltimate(tree.id);
            });
            onShow({ kind: 'ultimate', ultimate });
          }}
          onShow={() => {
            onShow({ kind: 'ultimate', ultimate });
          }}
        />
      ))}
      {Array.from({ length: rows - 1 }, (_, row) => {
        const y = ((ABILITY_GRID.y[row] ?? 0) + (ABILITY_GRID.y[row + 1] ?? 0)) / 2;
        const x = (ABILITY_GRID.x[0] + ABILITY_GRID.x[1]) / 2;
        return <span key={row} className="grid-cross" style={place([x, y])} aria-hidden="true" />;
      })}
      {tree.abilities.map((ability) => (
        <AbilityNode
          key={ability.id}
          ability={ability}
          build={build}
          selected={sameTarget(target, { kind: 'ability', ability })}
          onGive={() => {
            onChange((draft) => {
              draft.addAbilityRank(ability);
            });
            onShow({ kind: 'ability', ability });
          }}
          onTakeBack={() => {
            onChange((draft) => {
              draft.removeAbilityRank(ability);
            });
            onShow({ kind: 'ability', ability });
          }}
          onShow={() => {
            onShow({ kind: 'ability', ability });
          }}
        />
      ))}
    </div>
  );
}
