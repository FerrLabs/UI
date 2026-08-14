import { cp, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

// The foundation stylesheet pulls @fontsource CSS whose `url(./files/…)` stays
// relative to the fontsource package. Once Tailwind inlines that CSS into
// .storybook/preview.css the paths no longer resolve, so mirror the font files
// next to the generated stylesheet.
const require = createRequire(import.meta.url);
const target = new URL('../.storybook/files/', import.meta.url);

await mkdir(target, { recursive: true });

for (const family of ['@fontsource/fraunces', '@fontsource/dm-mono']) {
  const root = dirname(require.resolve(`${family}/package.json`));
  await cp(join(root, 'files'), target, { recursive: true });
}
