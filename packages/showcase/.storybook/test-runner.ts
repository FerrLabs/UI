import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, configureAxe, injectAxe } from 'axe-playwright';
import type { CDPSession, Page } from 'playwright';

const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

interface ViewportOption {
  readonly styles: { readonly width: string; readonly height: string };
}

interface EmulateOptions {
  readonly reducedMotion?: boolean;
  readonly touch?: boolean;
}

interface StoryGlobals {
  readonly storyGlobals?: { readonly viewport?: { readonly value?: string } };
}

const cdpSessions = new WeakMap<Page, CDPSession>();

async function emulate(page: Page, options: EmulateOptions): Promise<void> {
  const reducedMotion = options.reducedMotion === true;
  const touch = options.touch === true;
  await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
  const cdp = cdpSessions.get(page) ?? (await page.context().newCDPSession(page));
  cdpSessions.set(page, cdp);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: touch });
  const applied = await page.evaluate(() => ({
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    touch: matchMedia('(pointer: coarse)').matches,
  }));
  if (applied.reducedMotion !== reducedMotion || applied.touch !== touch) {
    throw new Error(
      `Media emulation not applied: wanted ${JSON.stringify({ reducedMotion, touch })}, got ${JSON.stringify(applied)}`,
    );
  }
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
    await emulate(page, storyContext.parameters?.emulate ?? {});
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
