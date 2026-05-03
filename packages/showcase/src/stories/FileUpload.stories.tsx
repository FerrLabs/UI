import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof FileUpload> = {
  title: 'Form/FileUpload',
  component: FileUpload,
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

function Demo({
  multiple = false,
  accept,
  maxSizeMB,
}: {
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <FileUpload
        onFiles={setFiles}
        multiple={multiple}
        accept={accept}
        maxSizeMB={maxSizeMB}
        label="Avatar"
        hint="PNG or JPG, square ratio recommended."
      />
      {files.length > 0 && (
        <ul className="text-xs text-slate-600 list-disc list-inside">
          {files.map((f) => (
            <li key={f.name}>
              {f.name} ({Math.round(f.size / 1024)} KB)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const Multiple: Story = {
  render: () => <Demo multiple />,
};

export const ImagesOnly: Story = {
  render: () => <Demo accept="image/png,image/jpeg" maxSizeMB={5} />,
};

export const Disabled: Story = {
  render: () => (
    <FileUpload
      onFiles={() => {}}
      disabled
      label="Disabled upload"
      hint="Enabled when an org owner is signed in."
    />
  ),
};
