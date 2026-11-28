import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { CardHeaderComponent } from './card/card.component';
import { CopyIconComponent } from './copy-icon/copy-icon.component';
import { DividerComponent } from './divider/divider.component';
import { LogoMarkComponent } from './logo-mark/logo-mark.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { SectionComponent } from './section/section.component';

function create<T>(ctor: new () => T): T {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new ctor());
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

describe('presentational component defaults', () => {
  it('divider is horizontal and unlabelled until configured', () => {
    const divider = create(DividerComponent);
    expect(divider.orientation()).toBe('horizontal');
    expect(divider.label()).toBeNull();
    setInput(divider.orientation, 'vertical');
    expect(divider.orientation()).toBe('vertical');
  });

  it('copy icon shows the copy state until told it copied', () => {
    const icon = create(CopyIconComponent);
    expect(icon.copied()).toBe(false);
    setInput(icon.copied, true);
    expect(icon.copied()).toBe(true);
  });

  it('logo mark is a 24px mark that inherits the text colour', () => {
    const mark = create(LogoMarkComponent);
    expect(mark.size()).toBe(24);
    expect(mark.accent()).toBe('currentColor');
  });

  it('page header has no breadcrumbs, count or help link by default', () => {
    const header = create(PageHeaderComponent);
    expect(header.breadcrumbs()).toEqual([]);
    expect(header.count()).toBeNull();
    expect(header.eyebrow()).toBeNull();
    expect(header.sub()).toBeNull();
    expect(header.helpHref()).toBeNull();
  });

  it('section and card header have no optional text by default', () => {
    expect(create(SectionComponent).hint()).toBeNull();
    expect(create(CardHeaderComponent).description()).toBeNull();
  });
});
