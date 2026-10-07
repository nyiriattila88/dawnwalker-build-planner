import type { JSX, ReactNode } from 'react';
import type { BuildView } from '../build/build';
import type { Ability, Perk, Tree, Ultimate } from '../catalog/catalog';
import type { CostData, RankData } from '../data/ranks';
import type { Timing } from '../data/trees';
import { abilityIconUrl, perkIconUrl } from './asset-urls';
import { SkillPointIcon, TimeIcon } from './cost-icons';
import type { InfoTarget } from './info-target';
import { NodeFrame } from './node-frame';
import { RankPips } from './rank-pips';

type InfoPanelProps = {
  readonly target: InfoTarget;
  readonly build: BuildView;
  readonly tree: (id: Tree['id']) => Tree;
};

const TIMING_TEXT: Readonly<Record<Timing, string>> = {
  day: 'Day only',
  night: 'Night only',
  anytime: 'Anytime',
};

const ESTIMATE =
  'Estimated: not read from the game yet, but taken from the pattern of the costs that were.';

function TimingLabel({
  timing,
  inferred,
}: {
  readonly timing: Timing;
  readonly inferred: boolean;
}): JSX.Element {
  return (
    <span className="timing">
      {timing !== 'night' && <span className="sun" aria-hidden="true" />}
      {timing !== 'day' && <span className="moon" aria-hidden="true" />}
      {TIMING_TEXT[timing]}
      {inferred && (
        <abbr title="Inferred from the tree and the description, not read from the game"> ≈</abbr>
      )}
    </span>
  );
}

function Cost({ cost }: { readonly cost: CostData }): JSX.Element | null {
  if (cost.skillPoints === 0 && cost.time === 0) return null;
  return (
    <span
      className={cost.estimated ? 'rank-cost estimated' : 'rank-cost'}
      title={cost.estimated ? ESTIMATE : undefined}
    >
      {cost.estimated && '≈ '}({cost.skillPoints} <SkillPointIcon />) ({cost.time} <TimeIcon />)
    </span>
  );
}

function Ranks({
  ranks,
  rank,
  granted,
}: {
  readonly ranks: readonly RankData[];
  readonly rank: number;
  readonly granted: number;
}): JSX.Element {
  return (
    <ol className="info-ranks">
      {ranks.map((entry, index) => (
        <li key={index} className={index < rank ? 'reached' : undefined}>
          <span className="rank-mark" aria-label={index < rank ? 'learned' : 'not learned'} />
          <span className="rank-effect">{entry.effect}</span>
          {index < granted ? (
            <span className="rank-cost">Granted by the story</span>
          ) : (
            <Cost cost={entry.cost} />
          )}
        </li>
      ))}
    </ol>
  );
}

function Head({
  icon,
  tree,
  shape,
  timing,
  name,
  pips,
}: {
  readonly icon: string;
  readonly tree: string;
  readonly shape: 'rosette' | 'disc';
  readonly timing: ReactNode;
  readonly name: string;
  readonly pips: ReactNode;
}): JSX.Element {
  return (
    <header className={`info-head tree-${tree}`}>
      <span className="info-node">
        <NodeFrame shape={shape} />
        <img className="glyph" src={icon} alt="" />
      </span>
      <span className="info-pips">{pips}</span>
      {timing}
      <h2>{name}</h2>
    </header>
  );
}

function PerkInfo({
  perk,
  build,
}: {
  readonly perk: Perk;
  readonly build: BuildView;
}): JSX.Element {
  const rank = build.rank(perk);
  const notes = [
    perk.questReward && 'Granted by a quest choice, not bought at a shrine.',
    perk.requires !== null &&
      !build.isOpen(perk) &&
      `Learn ${perk.requires.name} first to make it available.`,
    perk.manual && rank < perk.ranks.length && 'Find or buy its manual to make it available.',
  ].filter((note) => typeof note === 'string');
  return (
    <>
      <Head
        icon={perkIconUrl(perk.id)}
        tree={perk.tree}
        shape="rosette"
        timing={<TimingLabel timing={perk.timing} inferred={perk.timingEstimated} />}
        name={perk.name}
        pips={<RankPips rank={rank} ranks={perk.ranks.length} locked={false} />}
      />
      <p className="info-text">{perk.description}</p>
      <Ranks ranks={perk.ranks} rank={rank} granted={perk.questReward ? perk.ranks.length : 0} />
      <Notes notes={notes} />
    </>
  );
}

function UltimateInfo({
  ultimate,
  build,
  tree,
}: {
  readonly ultimate: Ultimate;
  readonly build: BuildView;
  readonly tree: Tree;
}): JSX.Element {
  const taken = build.ultimate(tree.id)?.id === ultimate.id;
  const needed = tree.ultimatePoints;
  const gate =
    needed === null
      ? 'Opens with Corruption, which feeding raises. The game does not show the level it needs.'
      : `Spend ${needed} skill points in ${tree.name} to unlock: ${needed - build.pointsToUltimate(tree.id)}/${needed}.`;
  return (
    <>
      <Head
        icon={perkIconUrl(ultimate.id)}
        tree={ultimate.tree}
        shape="rosette"
        timing={<TimingLabel timing={tree.timing} inferred={false} />}
        name={ultimate.name}
        pips={<RankPips rank={taken ? 1 : 0} ranks={1} locked={false} />}
      />
      <p className="info-text">{ultimate.description}</p>
      <ol className="info-ranks">
        <li className={taken ? 'reached' : undefined}>
          <span className="rank-mark" aria-label={taken ? 'learned' : 'not learned'} />
          <span className="rank-effect">Unlocks Ultimate.</span>
          <Cost cost={ultimate.cost} />
        </li>
      </ol>
      <Notes
        notes={[
          'Ultimate Perk. Once learned, other Ultimate Perks in this Skill Tree will not be accessible.',
          gate,
        ]}
      />
    </>
  );
}

const KIND_TEXT: Readonly<Record<Ability['kind'], string>> = {
  active: 'Active ability: slot it on the ability wheel, then put it on a quickslot.',
  passive: 'Works passively once it is slotted on the ability wheel.',
  slotless: 'Takes no slot on the ability wheel: it works once learned.',
};

function AbilityInfo({
  ability,
  build,
}: {
  readonly ability: Ability;
  readonly build: BuildView;
}): JSX.Element {
  const rank = build.abilityRank(ability);
  return (
    <>
      <Head
        icon={abilityIconUrl(ability.id)}
        tree={ability.tree}
        shape={ability.kind === 'passive' ? 'disc' : 'rosette'}
        timing={<TimingLabel timing={ability.timing} inferred={false} />}
        name={ability.name}
        pips={<RankPips rank={rank} ranks={ability.ranks.length} locked={false} />}
      />
      <p className="info-text">{ability.description}</p>
      <Ranks ranks={ability.ranks} rank={rank} granted={ability.granted} />
      <Notes
        notes={[
          KIND_TEXT[ability.kind],
          ...(ability.manual && rank < ability.ranks.length
            ? ['Find or buy its manual to make it available.']
            : []),
        ]}
      />
    </>
  );
}

const TREE_TEXT: Readonly<Record<Tree['id'], string>> = {
  witchcraft:
    'Hexes and the craft of a cunning man, cast from the runes cut into Coen’s arm. They seal over at night, so Witchcraft works in human form only.',
  swordmastery:
    'Weapon arts and the body behind them. Swordmastery works in both forms, by day and by night.',
  vampirism:
    'The powers of the night form. Its perks open as Corruption rises with feeding, and some abilities come from drinking the blood of the vrakhiri.',
};

function TreeInfo({
  tree,
  build,
}: {
  readonly tree: Tree;
  readonly build: BuildView;
}): JSX.Element {
  const spent = build.treeSpending(tree.id);
  return (
    <>
      <header className={`info-head tree-${tree.id}`}>
        <TimingLabel timing={tree.timing} inferred={false} />
        <h2>{tree.name}</h2>
      </header>
      <p className="info-text">{TREE_TEXT[tree.id]}</p>
      <p className="info-text">
        Spent in this tree: {spent.estimated && '≈ '}
        {spent.skillPoints} <SkillPointIcon /> and {spent.time} <TimeIcon />
      </p>
      <Notes
        notes={[
          'Click a perk or an ability to learn a rank, right-click to take it back. On a touch screen, tap and double-tap.',
        ]}
      />
    </>
  );
}

function Notes({ notes }: { readonly notes: readonly string[] }): JSX.Element | null {
  if (notes.length === 0) return null;
  return (
    <ul className="info-notes">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

// The panel beside the tree, worded like the game's own: what the node does at each rank, what the
// next rank costs, and what it needs first.
export function InfoPanel({ target, build, tree }: InfoPanelProps): JSX.Element {
  return (
    <aside className="info" aria-live="polite">
      {target.kind === 'perk' && <PerkInfo perk={target.perk} build={build} />}
      {target.kind === 'ultimate' && (
        <UltimateInfo ultimate={target.ultimate} build={build} tree={tree(target.ultimate.tree)} />
      )}
      {target.kind === 'ability' && <AbilityInfo ability={target.ability} build={build} />}
      {target.kind === 'tree' && <TreeInfo tree={target.tree} build={build} />}
    </aside>
  );
}
