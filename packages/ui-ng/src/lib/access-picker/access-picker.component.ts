import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';

import {
  ACCESS_PICKER_LABELS_EN,
  buildAccessSelection,
  initialScopeSet,
  matchingPreset,
  toggled,
  type AccessOrg,
  type AccessPickerLabels,
  type AccessPreset,
  type AccessPresetId,
  type AccessProduct,
  type AccessSelection,
} from './access-picker.model';

let nextId = 0;

@Component({
  selector: 'flr-access-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './access-picker.component.html',
  styleUrl: './access-picker.component.css',
})
export class AccessPickerComponent {
  readonly orgs = input.required<readonly AccessOrg[]>();
  readonly catalogue = input.required<readonly AccessProduct[]>();
  readonly presets = input.required<readonly AccessPreset[]>();
  readonly initialScopes = input<readonly string[]>([]);
  readonly labels = input<AccessPickerLabels>(ACCESS_PICKER_LABELS_EN);

  readonly selectionChange = output<AccessSelection | null>();

  protected readonly groupName = `flr-access-picker-${nextId++}`;
  protected readonly allOrgs = signal(true);
  protected readonly pickedOrgs = signal<ReadonlySet<string>>(new Set());
  protected readonly pickedScopes = linkedSignal<ReadonlySet<string>>(() =>
    initialScopeSet(this.initialScopes(), this.catalogue(), this.presets()),
  );

  protected readonly activePreset = computed(() =>
    matchingPreset(this.presets(), this.pickedScopes()),
  );

  private readonly selection = computed(() =>
    buildAccessSelection(this.allOrgs(), this.pickedOrgs(), this.pickedScopes(), this.orgs()),
  );

  constructor() {
    effect(() => this.selectionChange.emit(this.selection()));
  }

  protected useAllOrgs(): void {
    this.allOrgs.set(true);
  }

  protected useChosenOrgs(): void {
    this.allOrgs.set(false);
  }

  protected toggleOrg(id: string): void {
    this.pickedOrgs.update((current) => toggled(current, id));
  }

  protected toggleScope(scope: string): void {
    this.pickedScopes.update((current) => toggled(current, scope));
  }

  protected applyPreset(preset: AccessPreset): void {
    this.pickedScopes.set(new Set(preset.scopes));
  }

  protected presetLabel(id: AccessPresetId): string {
    const labels = this.labels();
    switch (id) {
      case 'read_only':
        return labels.presetReadOnly;
      case 'read_write':
        return labels.presetReadWrite;
      case 'full':
        return labels.presetFull;
    }
  }
}
