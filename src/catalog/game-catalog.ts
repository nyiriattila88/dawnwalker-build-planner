import { ABILITIES } from '../data/abilities';
import { ABILITY_WHEEL } from '../data/ability-wheel';
import { PERKS } from '../data/perks';
import { TREES } from '../data/trees';
import { ULTIMATES } from '../data/ultimates';
import { createCatalog, type Catalog } from './catalog';

export const createGameCatalog = (): Catalog =>
  createCatalog({
    trees: TREES,
    perks: PERKS,
    ultimates: ULTIMATES,
    abilities: ABILITIES,
    wheel: ABILITY_WHEEL,
  });
