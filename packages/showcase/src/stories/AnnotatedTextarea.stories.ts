import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AnnotatedTextareaComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const ENV = `SMTP_HOST, SMTP_PORT=smtp.example.com
MAIL_DKIM_DOMAIN=example.com
  MAIL DKIM SELECTOR=default
MAIL_DKIM_PRIVATE_KEY=-----BEGIN PRIVATE KEY----- MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ -----END PRIVATE KEY-----
SMTP_USER=postmaster@example.com`;

const CLEAN = `DATABASE_URL=postgres://localhost/app
STRIPE_API_KEY=sk_live_x`;

const meta: Meta<AnnotatedTextareaComponent> = {
  title: 'Primitives/AnnotatedTextarea',
  component: AnnotatedTextareaComponent,
  decorators: [moduleMetadata({ imports: [AnnotatedTextareaComponent, ReactiveFormsModule] })],
};

export default meta;
type Story = StoryObj<AnnotatedTextareaComponent>;

export const Empty: Story = {
  render: () => ({
    props: { control: new FormControl(''), diagnostics: [] },
    template: `
      <flr-annotated-textarea
        [rows]="6"
        [diagnostics]="diagnostics"
        [formControl]="control"
        aria-label="Paste .env content"
      />`,
  }),
};

/**
 * The three cases that only misbehave in a browser: a diagnostic on the first
 * line, where the bubble has no room above it; an indented entry, where the
 * underline has to follow the leading whitespace; and a line long enough to
 * soft-wrap, where a mark's bounding rect spans text that is not part of it.
 */
export const Diagnostics: Story = {
  render: () => ({
    props: {
      control: new FormControl(ENV),
      diagnostics: [
        {
          line: 0,
          from: 0,
          to: 20,
          message: 'invalid name: `,` is not allowed',
          severity: 'error',
        },
        {
          line: 2,
          from: 2,
          to: 20,
          message: 'invalid name: spaces are not allowed',
          severity: 'error',
        },
        {
          line: 3,
          from: 22,
          to: 120,
          message: 'value looks like a wrapped PEM, newlines were lost',
          severity: 'warning',
        },
      ],
    },
    template: `
      <flr-annotated-textarea
        [rows]="10"
        [diagnostics]="diagnostics"
        [formControl]="control"
        aria-label="Paste .env content"
      />`,
  }),
};

export const Clean: Story = {
  render: () => ({
    props: { control: new FormControl(CLEAN), diagnostics: [] },
    template: `
      <flr-annotated-textarea
        [rows]="6"
        [diagnostics]="diagnostics"
        [formControl]="control"
        aria-label="Paste .env content"
      />`,
  }),
};
