import { describe, expectTypeOf, it } from 'vitest';
import type { BuildView } from './build';

// Checked by the type check: a component handed a BuildView cannot change the build it reads.
describe('BuildView', () => {
  it('reads the ranks, the wheel and the quickslots without any of the commands', () => {
    expectTypeOf<BuildView>().toHaveProperty('rank');
    expectTypeOf<BuildView>().toHaveProperty('abilityRank');
    expectTypeOf<BuildView>().toHaveProperty('slotAt');
    expectTypeOf<BuildView>().toHaveProperty('quickslotAt');
    expectTypeOf<BuildView>().toHaveProperty('spending');
    expectTypeOf<BuildView>().not.toHaveProperty('addRank');
    expectTypeOf<BuildView>().not.toHaveProperty('addAbilityRank');
    expectTypeOf<BuildView>().not.toHaveProperty('takeUltimate');
    expectTypeOf<BuildView>().not.toHaveProperty('slot');
    expectTypeOf<BuildView>().not.toHaveProperty('setQuickslot');
    expectTypeOf<BuildView>().not.toHaveProperty('resetTree');
    expectTypeOf<BuildView>().not.toHaveProperty('clone');
  });
});
