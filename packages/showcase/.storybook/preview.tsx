import type { Preview, ReactRenderer } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
// @ts-expect-error — CSS import handled by Vite at runtime
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'paper',
      values: [
        { name: 'paper', value: '#faf8f4' },
        { name: 'white', value: '#ffffff' },
        { name: 'ink', value: '#1e293b' },
      ],
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
    withThemeByDataAttribute<ReactRenderer>({
      themes: {
        slate: 'slate',
        orange: 'orange',
        emerald: 'emerald',
        indigo: 'indigo',
        violet: 'violet',
        amber: 'amber',
      },
      defaultTheme: 'orange',
      attributeName: 'data-accent',
    }),
  ],
};

export default preview;
