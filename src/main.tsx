import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app';
import { createBrowserBuildAddress } from './app/build-address';
import { createBuildCodec } from './build/build-code';
import { createGameCatalog } from './catalog/game-catalog';
import '@fontsource/alegreya-sans/400.css';
import '@fontsource/alegreya-sans/500.css';
import '@fontsource/cinzel/500.css';
import '@fontsource/cinzel/700.css';
import './styles.css';

const root = document.getElementById('root');
if (root === null) throw new Error('index.html has no #root element');

const catalog = createGameCatalog();

createRoot(root).render(
  <StrictMode>
    <App
      catalog={catalog}
      codec={createBuildCodec(catalog)}
      address={createBrowserBuildAddress(window)}
    />
  </StrictMode>,
);
