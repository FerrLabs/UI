import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, Badge, Button, DataTable, type Column } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof DataTable> = {
  title: 'Data/DataTable',
  component: DataTable as never,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Auditor';
  joined: string;
  active: boolean;
}

const sampleMembers: Member[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    email: 'ada@acme.com',
    role: 'Owner',
    joined: '2025-12-04',
    active: true,
  },
  {
    id: '2',
    name: 'Linus Torvalds',
    email: 'linus@acme.com',
    role: 'Admin',
    joined: '2026-01-12',
    active: true,
  },
  {
    id: '3',
    name: 'Margaret Hamilton',
    email: 'margaret@acme.com',
    role: 'Member',
    joined: '2026-02-22',
    active: true,
  },
  {
    id: '4',
    name: 'Grace Hopper',
    email: 'grace@acme.com',
    role: 'Member',
    joined: '2026-03-08',
    active: false,
  },
  {
    id: '5',
    name: 'Alan Turing',
    email: 'alan@acme.com',
    role: 'Auditor',
    joined: '2026-04-19',
    active: true,
  },
];

const columns: Array<Column<Member>> = [
  {
    key: 'name',
    header: 'Member',
    sortBy: (r) => r.name,
    cell: (r) => (
      <div className="flex items-center gap-3">
        <Avatar name={r.name} size="sm" />
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">{r.name}</div>
          <div className="text-xs text-slate-500 truncate">{r.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    sortBy: (r) => r.role,
    cell: (r) => <Badge variant={r.role === 'Owner' ? 'accent' : 'neutral'}>{r.role}</Badge>,
  },
  { key: 'joined', header: 'Joined', sortBy: (r) => r.joined, cell: (r) => r.joined },
  {
    key: 'status',
    header: 'Status',
    align: 'right',
    cell: (r) =>
      r.active ? (
        <Badge variant="success" dot>
          Active
        </Badge>
      ) : (
        <Badge variant="neutral">Disabled</Badge>
      ),
  },
];

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <DataTable<Member>
        rows={sampleMembers}
        columns={columns}
        rowKey={(r) => r.id}
        initialSort={{ key: 'name', direction: 'asc' }}
      />
    </div>
  ),
};

export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<Set<React.Key>>(new Set(['1']));
    return (
      <div className="p-6">
        <div className="mb-3 text-sm text-slate-500">
          Selected: {selected.size === 0 ? 'none' : Array.from(selected).join(', ')}
        </div>
        <DataTable<Member>
          rows={sampleMembers}
          columns={columns}
          rowKey={(r) => r.id}
          selection={{ selected, onChange: setSelected }}
        />
      </div>
    );
  },
};

export const RowClick: Story = {
  render: () => (
    <div className="p-6">
      <DataTable<Member>
        rows={sampleMembers}
        columns={columns}
        rowKey={(r) => r.id}
        onRowClick={(r) => alert(`Clicked ${r.name}`)}
      />
    </div>
  ),
};

export const Compact: Story = {
  render: () => (
    <div className="p-6">
      <DataTable<Member>
        rows={sampleMembers}
        columns={columns}
        rowKey={(r) => r.id}
        density="compact"
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="p-6">
      <DataTable<Member> rows={[]} columns={columns} rowKey={(r) => r.id} loading loadingRows={4} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="p-6">
      <DataTable<Member>
        rows={[]}
        columns={columns}
        rowKey={(r) => r.id}
        empty={
          <div className="flex flex-col items-center gap-3">
            <p>No members yet.</p>
            <Button size="sm">Invite a member</Button>
          </div>
        }
      />
    </div>
  ),
};
