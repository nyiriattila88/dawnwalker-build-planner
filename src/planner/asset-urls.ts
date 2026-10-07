// Files under public/ are served below the base path, which is the repository name on GitHub Pages.
// GitHub Pages lets a browser keep a file for ten minutes, so the release in the query makes it fetch
// an image a release has replaced under the same name.
const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path}?v=${__APP_VERSION__}`;

// White glyphs on a transparent ground: the node frames around them are drawn by the page.
export const perkIconUrl = (id: string): string => assetUrl(`images/perks/${id}.png`);

export const abilityIconUrl = (id: string): string => assetUrl(`images/abilities/${id}.png`);

// A tree's sign, white on a transparent ground: the page colours it through a CSS mask.
export const treeEmblemUrl = (id: string): string => assetUrl(`images/trees/${id}.png`);

// The engraving behind every tree of the game's character screen, painted clear of the nodes on it.
export const characterBackgroundUrl = assetUrl('images/character-background.webp');

// The grey stone of the Active Abilities screen: a tile that repeats without a seam.
export const stoneUrl = assetUrl('images/stone.webp');
