import { useState, type JSX } from 'react';
import type { BuildCodec } from '../build/build-code';
import type { Catalog, Tree } from '../catalog/catalog';
import { backdropUrl } from '../planner/asset-urls';
import { AbilityWheel } from '../planner/ability-wheel';
import { FitToWidth } from '../planner/fit-to-width';
import { TREE_VIEW } from '../planner/geometry';
import { InfoPanel } from '../planner/info-panel';
import type { InfoTarget } from '../planner/info-target';
import { ScreenTabs, type Screen } from '../planner/screen-tabs';
import { SharePanel } from '../planner/share-panel';
import { TreePane } from '../planner/tree-pane';
import { TreeTabs } from '../planner/tree-tabs';
import type { BuildAddress } from './build-address';
import { RELEASE } from './release';
import { useBuild } from './use-build';

type AppProps = {
  readonly catalog: Catalog;
  readonly codec: BuildCodec;
  readonly address: BuildAddress;
};

const REPOSITORY_URL = 'https://github.com/nyiriattila88/dawnwalker-build-planner';

export function App({ catalog, codec, address }: AppProps): JSX.Element {
  const { build, code, link, unreadableAddress, apply, load, reset } = useBuild(
    catalog,
    codec,
    address,
  );
  const [screen, setScreen] = useState<Screen>('character');
  const [tree, setTree] = useState<Tree>(() => catalog.tree('swordmastery'));
  const [target, setTarget] = useState<InfoTarget>({ kind: 'tree', tree });

  const selectTree = (next: Tree): void => {
    setTree(next);
    setTarget({ kind: 'tree', tree: next });
  };

  return (
    <div className="page">
      <div
        className="backdrop"
        aria-hidden="true"
        style={{ backgroundImage: `url("${backdropUrl}")` }}
      />
      <header className="masthead">
        <h1>
          <span className="masthead-game">The Blood of Dawnwalker</span>
          <span className="masthead-app">Build Planner</span>
        </h1>
      </header>

      <ScreenTabs screen={screen} build={build} onSelect={setScreen} />

      <main className="screen">
        {screen === 'character' ? (
          <>
            <TreeTabs trees={catalog.trees} current={tree} build={build} onSelect={selectTree} />
            <div className="character">
              <FitToWidth width={TREE_VIEW.width} height={TREE_VIEW.height}>
                <TreePane
                  tree={tree}
                  build={build}
                  target={target}
                  onChange={apply}
                  onShow={setTarget}
                />
              </FitToWidth>
              <InfoPanel target={target} build={build} tree={catalog.tree} />
            </div>
          </>
        ) : (
          <AbilityWheel
            catalog={catalog}
            build={build}
            info={<InfoPanel target={target} build={build} tree={catalog.tree} />}
            onChange={apply}
            onShow={setTarget}
          />
        )}
      </main>

      <div className="buttons">
        {screen === 'character' && (
          <button
            type="button"
            onClick={() => {
              apply((draft) => {
                draft.resetTree(tree.id);
              });
            }}
          >
            Reset {tree.name}
          </button>
        )}
        <button type="button" onClick={reset}>
          Reset All
        </button>
      </div>

      <SharePanel code={code} link={link} onLoad={load} unreadableAddress={unreadableAddress} />

      <footer className="footer">
        A fan-made planner for The Blood of Dawnwalker, not affiliated with Rebel Wolves or Bandai
        Namco. Costs marked ≈ are estimates until they are read from the game. ·{' '}
        <a href={REPOSITORY_URL}>source on GitHub</a>
        <br />
        <span className="release">
          v{RELEASE.version} · {RELEASE.commit} · {RELEASE.builtAt}
        </span>
      </footer>
    </div>
  );
}
