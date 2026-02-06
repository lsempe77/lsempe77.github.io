// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lsempe77.github.io',
  vite: {
    plugins: [tailwindcss()]
  }
});