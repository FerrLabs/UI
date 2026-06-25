import type { Preview } from '@storybook/react';
import { useEffect } from 'react';
// @ts-expect-error — CSS import handled by Vite at runtime
import './preview.css';

export const globalTypes = {
  brand: {
    name: 'Brand',
    description: 'Product accent',
    toolbar: {
      icon: 'paintbrush',
      dynamicTitle: true,
      items: [
        { value: 'slate', title: 'FerrLabs' },
        { value: 'orange', title: 'FerrFlow' },
        { value: 'emerald', title: 'FerrVault' },
        { value: 'indigo', title: 'FerrTrack' },
        { value: 'violet', title: 'FerrGrowth' },
        { value: 'amber', title: 'FerrFleet' },
        { value: 'teal', title: 'FerrLens' },
      ],
    },
  },
  theme: {
    name: 'Theme',
    description: 'Light / dark',
    toolbar: {
      icon: 'circlehollow',
      dynamicTitle: true,
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
};

const preview: Preview = {
  initialGlobals: { brand: 'orange', theme: 'light' },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    options: {
      storySort: {
        order: [
          'Brand',
          'Layout',
          'Navigation',
          'Forms',
          'Actions',
          'Data Display',
          'Feedback',
          'Overlays',
        ],
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      useEffect(() => {
        const el = document.documentElement;
        el.dataset.accent = ctx.globals.brand;
        el.dataset.theme = ctx.globals.theme;
      }, [ctx.globals.brand, ctx.globals.theme]);
      return <Story />;
    },
  ],
};

export default preview;
