import type { Preview } from '@storybook/angular';

Object.assign(globalThis, { ngServerMode: false });

const ACCENTS = [
  { value: 'slate', title: 'FerrLabs' },
  { value: 'orange', title: 'FerrFlow' },
  { value: 'emerald', title: 'FerrVault' },
  { value: 'indigo', title: 'FerrTrack' },
  { value: 'violet', title: 'FerrGrowth' },
  { value: 'amber', title: 'FerrFleet' },
  { value: 'teal', title: 'FerrLens' },
];

const preview: Preview = {
  globalTypes: {
    accent: {
      description: 'Product accent',
      toolbar: { icon: 'paintbrush', items: ACCENTS, dynamicTitle: true },
    },
    theme: {
      description: 'Colour scheme',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    style: {
      description: 'Style preset',
      toolbar: {
        icon: 'component',
        items: [
          { value: 'editorial', title: 'Editorial' },
          { value: 'precision', title: 'Precision' },
          { value: 'soft', title: 'Soft' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { accent: 'slate', theme: 'light', style: 'editorial' },
  decorators: [
    (story, context) => {
      const root = document.documentElement;
      root.dataset['accent'] = String(context.globals['accent'] ?? 'slate');
      root.dataset['theme'] = String(context.globals['theme'] ?? 'light');
      const style = String(context.globals['style'] ?? 'editorial');
      if (style === 'editorial') delete root.dataset['style'];
      else root.dataset['style'] = style;
      return story();
    },
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: ['Foundation', 'Primitives', 'Forms', 'Overlays', 'App chrome', 'Site chrome'],
      },
    },
  },
};

export default preview;
