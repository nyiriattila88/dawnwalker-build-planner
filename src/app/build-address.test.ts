import { describe, expect, it } from 'vitest';
import { buildCodeIn } from './build-address';

const PAGE = 'https://nyiriattila88.github.io/dawnwalker-build-planner/';

describe('buildCodeIn', () => {
  it('takes the build parameter of a shared link, mark and all', () => {
    const code = buildCodeIn(`${PAGE}?build=.BdtLTzYg_s7Micg`);

    expect(code).toBe('.BdtLTzYg_s7Micg');
  });

  it('finds no code in a plain page address or in the hash of one', () => {
    const codes = [PAGE, `${PAGE}#.BdtLTzYg_s7Micg`].map(buildCodeIn);

    expect(codes).toEqual(['', '']);
  });

  it('keeps pasted text that is not a link, without the surrounding spaces', () => {
    const code = buildCodeIn('  .BdtLTzYg_s7Micg \n');

    expect(code).toBe('.BdtLTzYg_s7Micg');
  });

  it('reads a link of 1.0, whose codes carry no mark', () => {
    const code = buildCodeIn(`${PAGE}?build=BK9vcpGz_wvW1KAS`);

    expect(code).toBe('BK9vcpGz_wvW1KAS');
  });
});
