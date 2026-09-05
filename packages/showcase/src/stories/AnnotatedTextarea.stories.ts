import { AnnotatedTextareaComponent } from '@ferrlabs/ui-ng';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const ENV = `SMTP_HOST, SMTP_PORT=smtp.example.com
MAIL_DKIM_DOMAIN=example.com
  MAIL DKIM SELECTOR=default
MAIL_DKIM_PRIVATE_KEY=-----BEGIN PRIVATE KEY----- MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ -----END PRIVATE KEY-----
SMTP_USER=postmaster@example.com`;

const meta: Meta<AnnotatedTextareaComponent> = {
  title: 'Primitives/AnnotatedTextarea',
  component: AnnotatedTextareaComponent,
  decorators: [moduleMetadata({ imports: [AnnotatedTextareaComponent, FormsModule] })],
  render: (args) => ({
    props: args,
    template: `<flr-annotated-textarea [rows]="10" [diagnostics]="diagnostics" [ngModel]="text" />`,
  }),
};

export default meta;
type Story = StoryObj<AnnotatedTextareaComponent>;

export const Empty: Story = {
  render: () => ({
    props: { text: '', diagnostics: [] },
    template: `<flr-annotated-textarea [rows]="6" [diagnostics]="diagnostics" [ngModel]="text" />`,
  }),
};

/**
 * The three cases that only misbehave in a browser: a diagnostic on the first
 * line, where the bubble has to escape the frame; an indented entry, where the
 * underline has to follow the leading whitespace; and a line long enough to
 * soft-wrap, where a mark's bounding rect spans text that is not part of it.
 */
export const Diagnostics: Story = {
  render: () => ({
    props: {
      text: ENV,
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
    template: `<flr-annotated-textarea [rows]="10" [diagnostics]="diagnostics" [ngModel]="text" />`,
  }),
};

export const Clean: Story = {
  render: () => ({
    props: {
      text: `DATABASE_URL=postgres://localhost/app\nSTRIPE_API_KEY=sk_live_x`,
      diagnostics: [],
    },
    template: `<flr-annotated-textarea [rows]="6" [diagnostics]="diagnostics" [ngModel]="text" />`,
  }),
};
