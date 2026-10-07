import type { Catalog } from '../catalog/catalog';
import { Build, QUICKSLOT_TREES, type BuildView, type QuickslotSet } from './build';

export type BuildCodec = {
  readonly encode: (build: BuildView) => string;
  // The build a code stands for, or null when the text is not exactly one build's code.
  readonly decode: (code: string) => Build | null;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const BASE = BigInt(ALPHABET.length);
// Far longer than any build's code, so pasted junk is turned away before any arithmetic.
const LONGEST = 120;

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
// counts them, and the wheel before the quickslots, which only take what is on the wheel.
function fields(catalog: Catalog): readonly Field[] {
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
    radix: ability.ranks.length - ability.granted + 1,
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

// Writes a build as one mixed-radix number in base64url. A build has exactly one code and a code
// exactly one build: decoding rebuilds through the commands of Build and accepts only a code that
// the result writes back unchanged.
export function createBuildCodec(catalog: Catalog): BuildCodec {
  const walk = fields(catalog);

  const encode = (build: BuildView): string => {
    let value = 0n;
    let weight = 1n;
    for (const field of walk) {
      value += BigInt(field.read(build)) * weight;
      weight *= BigInt(field.radix);
    }
    return toText(value);
  };

  const decode = (code: string): Build | null => {
    if (code === '' || code.length > LONGEST) return null;
    let rest = fromText(code);
    if (rest === null) return null;
    const build = new Build(catalog);
    for (const field of walk) {
      const radix = BigInt(field.radix);
      field.write(build, Number(rest % radix));
      rest /= radix;
    }
    if (rest !== 0n) return null;
    return encode(build) === code ? build : null;
  };

  return { encode, decode };
}
