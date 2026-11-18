import { ButtonComponent, ConnectionCardComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<ConnectionCardComponent> = {
  title: 'Surfaces/ConnectionCard',
  component: ConnectionCardComponent,
  decorators: [moduleMetadata({ imports: [ConnectionCardComponent, ButtonComponent] })],
  args: {
    title: 'FerrFleet',
    description: 'Connection used to launch agents on issues.',
    tone: 'ok',
    headline: 'Connected to Acme by Ada.',
    meta: [
      { label: 'Connected', value: 'Jan 4, 2026' },
      { label: 'Token', value: 'fft_ab12…', mono: true },
      { label: 'Permissions', value: 'issues:read, issues:write', mono: true },
    ],
    progress: null,
    confirming: false,
    loading: false,
    error: null,
  },
  argTypes: { tone: { control: 'inline-radio', options: ['ok', 'alert', 'idle'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:560px">
        <flr-connection-card
          [title]="title"
          [description]="description"
          [tone]="tone"
          [headline]="headline"
          [meta]="meta"
          [progress]="progress"
          [confirming]="confirming"
          [loading]="loading"
          [error]="error"
        >
          <flr-button connection-action size="sm" variant="ghost">Reconnect</flr-button>
          <flr-button connection-danger size="sm" variant="ghost">Disconnect</flr-button>
          <flr-button connection-confirm size="sm" variant="danger">Disconnect</flr-button>
        </flr-connection-card>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<ConnectionCardComponent>;

export const Connected: Story = {};

export const NotConnected: Story = {
  args: { tone: 'idle', headline: 'Not connected.', meta: [] },
};

export const MissingScopes: Story = {
  args: { tone: 'alert', headline: 'Connected, but missing permissions (issues:write).' },
};

export const Revoked: Story = {
  args: { tone: 'alert', headline: 'The connection was revoked.', meta: [] },
};

export const Redirecting: Story = {
  args: { tone: 'idle', headline: 'Not connected.', meta: [], progress: 'Redirecting to approve…' },
};

export const Loading: Story = { args: { loading: true } };

export const LoadFailed: Story = {
  args: { error: 'Could not load the connection status.' },
};

export const ConfirmingDisconnect: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:560px">
        <flr-connection-card
          [title]="title"
          [description]="description"
          [tone]="tone"
          [headline]="headline"
          [meta]="meta"
          [confirming]="true"
        >
          <div connection-confirm role="group" aria-label="Disconnect">
            <p style="margin:0 0 8px; font-size:13.5px; font-weight:600">Disconnect FerrFleet?</p>
            <p style="margin:0 0 8px; font-size:12.5px">Agent launches stop until it is reconnected.</p>
            <div style="display:flex; gap:8px">
              <flr-button size="sm" variant="danger">Disconnect</flr-button>
              <flr-button size="sm" variant="ghost">Cancel</flr-button>
            </div>
          </div>
        </flr-connection-card>
      </div>`,
  }),
};

export const WithExtraContent: Story = {
  args: { tone: 'idle', headline: 'Not connected.', meta: [] },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:560px">
        <flr-connection-card [title]="title" [description]="description" [tone]="tone" [headline]="headline">
          <flr-button connection-action size="sm">Connect account</flr-button>
          <details>
            <summary>Advanced: paste a token</summary>
            <p style="font-size:13px">Token form goes here.</p>
          </details>
        </flr-connection-card>
      </div>`,
  }),
};
