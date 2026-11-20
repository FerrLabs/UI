import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonComponent,
  CardComponent,
  CardHeaderComponent,
  InputComponent,
  SelectComponent,
  TagComponent,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from 'storybook/test';

const meta: Meta = {
  title: 'Foundation/Style presets',
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        ButtonComponent,
        CardComponent,
        CardHeaderComponent,
        InputComponent,
        SelectComponent,
        TagComponent,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj;

const PRESETS = [
  { name: 'precision', control: '4px', card: '4px', heightOffset: -4 },
  { name: 'soft', control: '8px', card: '12px', heightOffset: -4 },
] as const;

const setStyle = (style: string | undefined): void => {
  const root = document.documentElement;
  if (style === undefined) delete root.dataset['style'];
  else root.dataset['style'] = style;
};

export const Presets: Story = {
  render: () => ({
    props: { name: new FormControl('ferrflow-cloud'), region: new FormControl('eu-west-1') },
    template: `
      <flr-card style="max-width:360px">
        <flr-card-header title="Production" description="eu-west-1" />
        <div style="display:grid; gap:12px; margin-top:12px">
          <flr-tag variant="success" style="justify-self:start">Stable</flr-tag>
          <flr-input aria-label="Name" [formControl]="name" />
          <flr-select aria-label="Region" [formControl]="region">
            <option>eu-west-1</option>
            <option>us-east-1</option>
          </flr-select>
          <div style="display:flex; gap:8px">
            <flr-button>Deploy</flr-button>
            <flr-button variant="ghost">Cancel</flr-button>
          </div>
        </div>
      </flr-card>`,
  }),
  play: async ({ canvasElement }) => {
    const root = document.documentElement;
    const initial = root.dataset['style'];
    const button = within(canvasElement).getByRole('button', { name: 'Deploy' });
    const card = canvasElement.querySelector<HTMLElement>('.flr-card')!;

    setStyle(undefined);
    const baselineHeight = button.getBoundingClientRect().height;

    try {
      for (const preset of PRESETS) {
        setStyle(preset.name);
        expect(getComputedStyle(button).borderRadius).toBe(preset.control);
        expect(getComputedStyle(card).borderRadius).toBe(preset.card);
        expect(button.getBoundingClientRect().height).toBeCloseTo(
          baselineHeight + preset.heightOffset,
          1,
        );
      }
    } finally {
      setStyle(initial);
    }
  },
};
