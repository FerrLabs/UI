import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, configureAxe, injectAxe } from 'axe-playwright';

const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

interface ViewportOption {
  readonly styles: { readonly width: string; readonly height: string };
}

interface StoryGlobals {
  readonly storyGlobals?: { readonly viewport?: { readonly value?: string } };
}

const config: TestRunnerConfig = {
  async preVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    const options: Record<string, ViewportOption> =
      storyContext.parameters?.viewport?.options ?? {};
    const viewport = (storyContext as StoryGlobals).storyGlobals?.viewport?.value;
    const selected = viewport ? options[viewport] : undefined;
    await page.setViewportSize(
      selected
        ? {
            width: Number.parseInt(selected.styles.width, 10),
            height: Number.parseInt(selected.styles.height, 10),
          }
        : DEFAULT_VIEWPORT,
    );
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    });

    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};

export default config;
