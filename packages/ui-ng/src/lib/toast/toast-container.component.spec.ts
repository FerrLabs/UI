import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService, type ToastVariant } from './toast.service';

class FakeNode {
  isConnected = true;
  readonly children = new Set<FakeNode>();
  contains(other: unknown): boolean {
    return other === this || [...this.children].some((child) => child.contains(other));
  }
}

class FakeElement extends FakeNode {
  hovered = false;
  parentElement: FakeElement | null = null;
  closestToast: FakeElement | null = null;
  focus = vi.fn(() => {
    documentStub.activeElement = this;
  });
  matches(selector: string): boolean {
    return selector === ':hover' && this.hovered;
  }
  closest(selector: string): FakeElement | null {
    return selector === '.flr-toast' ? this.closestToast : null;
  }
  adopt(child: FakeNode): void {
    this.children.add(child);
    if (child instanceof FakeElement) child.parentElement = this;
  }
}

const documentStub: { activeElement: FakeNode | null } = { activeElement: null };

class ContainerProbe extends ToastContainerComponent {
  iconFor(variant: ToastVariant): string {
    return this.icon(variant);
  }
  clickDismiss(event: Event, id: string): void {
    this.dismiss(event, id);
  }
  clickAction(event: Event, id: string): void {
    this.runAction(event, id);
  }
  hoverIn(id: string): void {
    this.pause(id);
  }
  focusIn(event: FocusEvent, id: string): void {
    this.onFocusIn(event, id);
  }
  leave(event: MouseEvent | FocusEvent, id: string): void {
    this.resumeWhenIdle(event, id);
  }
}

function createContainer() {
  const service = {
    toasts: signal([]).asReadonly(),
    dismiss: vi.fn(),
    runAction: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  };
  const injector = Injector.create({ providers: [{ provide: ToastService, useValue: service }] });
  const container = runInInjectionContext(injector, () => new ContainerProbe());
  return { container, service };
}

function toastInRegion() {
  const region = new FakeElement();
  const toast = new FakeElement();
  region.adopt(toast);
  toast.closestToast = toast;
  return { region, toast };
}

const asEvent = <T>(value: object) => value as unknown as T;

beforeEach(() => {
  documentStub.activeElement = null;
  vi.stubGlobal('HTMLElement', FakeElement);
  vi.stubGlobal('Node', FakeNode);
  vi.stubGlobal('document', documentStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ToastContainerComponent icons', () => {
  it.each<[ToastVariant, string]>([
    ['info', '·'],
    ['success', '✓'],
    ['warning', '!'],
    ['error', '×'],
  ])('%s uses %s', (variant, glyph) => {
    expect(createContainer().container.iconFor(variant)).toBe(glyph);
  });
});

describe('ToastContainerComponent actions', () => {
  it('dismiss forwards to the service', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    container.clickDismiss(asEvent({ currentTarget: toast }), 'a');
    expect(service.dismiss).toHaveBeenCalledWith('a');
  });

  it('runAction forwards to the service', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    container.clickAction(asEvent({ currentTarget: toast }), 'a');
    expect(service.runAction).toHaveBeenCalledWith('a');
  });

  it('hovering pauses the timer', () => {
    const { container, service } = createContainer();
    container.hoverIn('a');
    expect(service.pause).toHaveBeenCalledWith('a');
  });
});

describe('ToastContainerComponent focus return', () => {
  it('restores focus when the clicked control sits inside the focused toast', () => {
    const { container } = createContainer();
    const { toast } = toastInRegion();
    const trigger = new FakeElement();
    const button = new FakeElement();
    toast.adopt(button);
    button.closestToast = toast;
    container.focusIn(asEvent({ relatedTarget: trigger, currentTarget: toast }), 'a');
    documentStub.activeElement = button;
    container.clickDismiss(asEvent({ currentTarget: button }), 'a');
    expect(trigger.focus).toHaveBeenCalledTimes(1);
  });

  it('does not steal focus when it already moved outside the toast', () => {
    const { container } = createContainer();
    const { toast } = toastInRegion();
    const trigger = new FakeElement();
    const button = new FakeElement();
    toast.adopt(button);
    button.closestToast = toast;
    container.focusIn(asEvent({ relatedTarget: trigger, currentTarget: toast }), 'a');
    documentStub.activeElement = new FakeElement();
    container.clickDismiss(asEvent({ currentTarget: button }), 'a');
    expect(trigger.focus).not.toHaveBeenCalled();
  });

  it('does not focus an element that left the document', () => {
    const { container } = createContainer();
    const { toast } = toastInRegion();
    const trigger = new FakeElement();
    trigger.isConnected = false;
    const button = new FakeElement();
    toast.adopt(button);
    button.closestToast = toast;
    container.focusIn(asEvent({ relatedTarget: trigger, currentTarget: toast }), 'a');
    documentStub.activeElement = button;
    container.clickAction(asEvent({ currentTarget: button }), 'a');
    expect(trigger.focus).not.toHaveBeenCalled();
  });

  it('does nothing when no focus origin was recorded', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    const button = new FakeElement();
    toast.adopt(button);
    button.closestToast = toast;
    documentStub.activeElement = button;
    expect(() => container.clickDismiss(asEvent({ currentTarget: button }), 'a')).not.toThrow();
    expect(service.dismiss).toHaveBeenCalledWith('a');
  });

  it('ignores focus that moved between toasts in the same region', () => {
    const { container, service } = createContainer();
    const { region, toast } = toastInRegion();
    const sibling = new FakeElement();
    region.adopt(sibling);
    const button = new FakeElement();
    toast.adopt(button);
    button.closestToast = toast;
    container.focusIn(asEvent({ relatedTarget: sibling, currentTarget: toast }), 'a');
    documentStub.activeElement = button;
    container.clickDismiss(asEvent({ currentTarget: button }), 'a');
    expect(sibling.focus).not.toHaveBeenCalled();
    expect(service.pause).toHaveBeenCalledWith('a');
  });

  it('ignores a focus origin that is not an element', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    container.focusIn(asEvent({ relatedTarget: null, currentTarget: toast }), 'a');
    expect(service.pause).toHaveBeenCalledWith('a');
  });

  it('keeps the first origin while focus moves inside the region', () => {
    const { container } = createContainer();
    const { toast } = toastInRegion();
    const first = new FakeElement();
    const button = new FakeElement();
    toast.adopt(button);
    button.closestToast = toast;
    container.focusIn(asEvent({ relatedTarget: first, currentTarget: toast }), 'a');
    container.focusIn(asEvent({ relatedTarget: button, currentTarget: toast }), 'a');
    documentStub.activeElement = button;
    container.clickDismiss(asEvent({ currentTarget: button }), 'a');
    expect(first.focus).toHaveBeenCalledTimes(1);
  });
});

describe('ToastContainerComponent resume', () => {
  it('resumes on mouseleave when nothing inside is focused', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    documentStub.activeElement = new FakeElement();
    container.leave(asEvent({ type: 'mouseleave', currentTarget: toast }), 'a');
    expect(service.resume).toHaveBeenCalledWith('a');
  });

  it('stays paused on mouseleave while a control inside has focus', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    const button = new FakeElement();
    toast.adopt(button);
    documentStub.activeElement = button;
    container.leave(asEvent({ type: 'mouseleave', currentTarget: toast }), 'a');
    expect(service.resume).not.toHaveBeenCalled();
  });

  it('resumes on focusout when focus leaves the toast', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    container.leave(
      asEvent({ type: 'focusout', relatedTarget: new FakeElement(), currentTarget: toast }),
      'a',
    );
    expect(service.resume).toHaveBeenCalledWith('a');
  });

  it('stays paused on focusout between two controls of the same toast', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    const next = new FakeElement();
    toast.adopt(next);
    container.leave(asEvent({ type: 'focusout', relatedTarget: next, currentTarget: toast }), 'a');
    expect(service.resume).not.toHaveBeenCalled();
  });

  it('resumes on focusout to nowhere', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    container.leave(asEvent({ type: 'focusout', relatedTarget: null, currentTarget: toast }), 'a');
    expect(service.resume).toHaveBeenCalledWith('a');
  });

  it('stays paused while the pointer is still over the toast', () => {
    const { container, service } = createContainer();
    const { toast } = toastInRegion();
    toast.hovered = true;
    container.leave(
      asEvent({ type: 'focusout', relatedTarget: new FakeElement(), currentTarget: toast }),
      'a',
    );
    expect(service.resume).not.toHaveBeenCalled();
  });
});
