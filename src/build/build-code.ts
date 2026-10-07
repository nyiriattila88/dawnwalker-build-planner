import type { Ability, Catalog } from '../catalog/catalog';
import { Build, QUICKSLOT_TREES, type BuildView, type QuickslotSet } from './build';

export type BuildCodec = {
  readonly encode: (build: BuildView) => string;
  // The build a code stands for, or null when the text is not exactly one build's code.
  readonly decode: (code: string) => Build | null;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const BASE = BigInt(ALPHABET.length);
// Starts every code written since 1.0.2. The alphabet lacks it, so no 1.0 code can carry it.
const MARK = '.';
// Far longer than any build's code, so pasted junk is turned away before any arithmetic.
const LONGEST = 120;

// 1.0 took Mercurial Fervour's first rank as granted, so its digit counted the ranks bought on top.
// Its codes carry no mark and are read with the ranks they bought.
const GRANTED_IN_1_0: Readonly<Partial<Record<string, number>>> = { 'mercurial-fervour': 1 };

// One digit of the build: its radix, how to read it from a build and how to write it into one.
type Field = {
  readonly radix: number;
  readonly read: (build: BuildView) => number;
  readonly write: (build: Build, digit: number) => void;
};

const repeat = (times: number, action: () => void): void => {
  for (let index = 0; index < times; index++) action();
};

// The fields in the order a code walks them. Ranks come before the ultimates, whose requirement
// counts them, and the wheel before the quickslots, which only take what is on the wheel. An
// ability's digit counts the ranks bought, up to what its layout's granted rank left to buy.
function fields(catalog: Catalog, granted: (ability: Ability) => number): readonly Field[] {
  const perks = catalog.perks.map((perk): Field => ({
    radix: perk.ranks.length + 1,
    read: (build) => build.rank(perk),
    write: (build, digit) => {
      repeat(digit, () => {
        build.addRank(perk);
      });
    },
  }));
  const abilities = catalog.abilities.map((ability): Field => ({
    radix: ability.ranks.length - granted(ability) + 1,
    read: (build) => build.abilityRank(ability) - ability.granted,
    write: (build, digit) => {
      repeat(digit, () => {
        build.addAbilityRank(ability);
      });
    },
  }));
  const ultimates = catalog.trees.map((tree): Field => ({
    radix: tree.ultimates.length + 1,
    read: (build) => {
      const taken = build.ultimate(tree.id);
      return taken === null ? 0 : tree.ultimates.indexOf(taken) + 1;
    },
    write: (build, digit) => {
      const ultimate = tree.ultimates[digit - 1];
      if (ultimate !== undefined) build.takeUltimate(ultimate);
    },
  }));
  const most =
    catalog.wheel.baseSlots + Math.max(...catalog.trees.map((tree) => tree.slotPerk.ranks.length));
  const slots = catalog.trees.flatMap((tree) => {
    const slottable = tree.abilities.filter((ability) => ability.kind !== 'slotless');
    return Array.from({ length: most }, (_, index): Field => ({
      radix: slottable.length + 1,
      read: (build) => {
        const held = build.slotAt(tree.id, index);
        return held === null ? 0 : slottable.indexOf(held) + 1;
      },
      write: (build, digit) => {
        const ability = slottable[digit - 1];
        if (ability !== undefined) build.slot(ability, index);
      },
    }));
  });
  const quickslots = (['day', 'night'] as const satisfies readonly QuickslotSet[]).flatMap(
    (set) => {
      const actives = catalog.abilities.filter(
        (a) => a.kind === 'active' && QUICKSLOT_TREES[set].includes(a.tree),
      );
      return Array.from({ length: catalog.wheel.quickslots }, (_, index): Field => ({
        radix: actives.length + 1,
        read: (build) => {
          const held = build.quickslotAt(set, index);
          return held === null ? 0 : actives.indexOf(held) + 1;
        },
        write: (build, digit) => {
          const ability = actives[digit - 1];
          if (ability !== undefined) build.setQuickslot(set, index, ability);
        },
      }));
    },
  );
  return [...perks, ...abilities, ...ultimates, ...slots, ...quickslots];
}

const toText = (value: bigint): string => {
  let text = '';
  let rest = value;
  do {
    text = (ALPHABET[Number(rest % BASE)] ?? '') + text;
    rest /= BASE;
  } while (rest > 0n);
  return text;
};

const fromText = (text: string): bigint | null => {
  let value = 0n;
  for (const char of text) {
    const digit = ALPHABET.indexOf(char);
    if (digit < 0) return null;
    value = value * BASE + BigInt(digit);
  }
  return value;
};

const write = (walk: readonly Field[], build: BuildView): string => {
  let value = 0n;
  let weight = 1n;
  for (const field of walk) {
    value += BigInt(field.read(build)) * weight;
    weight *= BigInt(field.radix);
  }
  return toText(value);
};

// Writes a build as a mark and one mixed-radix number in base64url. A build has exactly one code and
// a code exactly one build: decoding rebuilds through the commands of Build and accepts only a code
// that the result writes back unchanged.
export function createBuildCodec(catalog: Catalog): BuildCodec {
  const current = fields(catalog, (ability) => ability.granted);
  const before = fields(catalog, (ability) => GRANTED_IN_1_0[ability.id] ?? ability.granted);

  const encode = (build: BuildView): string => MARK + write(current, build);

  const decode = (code: string): Build | null => {
    if (code.length > LONGEST) return null;
    const marked = code.startsWith(MARK);
    const walk = marked ? current : before;
    const text = marked ? code.slice(MARK.length) : code;
    if (text === '') return null;
    let rest = fromText(text);
    if (rest === null) return null;
    const build = new Build(catalog);
    for (const field of walk) {
      const radix = BigInt(field.radix);
      field.write(build, Number(rest % radix));
      rest /= radix;
    }
    if (rest !== 0n) return null;
    return write(walk, build) === text ? build : null;
  };

  return { encode, decode };
}
