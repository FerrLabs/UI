import { CodeComponent } from '@ferrlabs/ui-ng/markdown';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const RUST = `use std::collections::HashMap;

pub fn tally<'a>(words: &[&'a str]) -> HashMap<&'a str, usize> {
    let mut counts = HashMap::new();
    for word in words {
        *counts.entry(*word).or_insert(0) += 1;
    }
    counts
}`;

const meta: Meta<CodeComponent> = {
  title: 'Content/Code',
  component: CodeComponent,
  decorators: [moduleMetadata({ imports: [CodeComponent] })],
  render: (args) => ({
    props: args,
    template: `<flr-code [code]="code" [language]="language" />`,
  }),
  args: { code: RUST, language: 'rust' },
  argTypes: {
    language: {
      control: 'select',
      options: ['rust', 'typescript', 'json', 'bash', 'diff', 'yaml', 'sql', 'unknown'],
    },
  },
};

export default meta;
type Story = StoryObj<CodeComponent>;

export const Rust: Story = {};

export const Json: Story = {
  args: {
    language: 'json',
    code: JSON.stringify(
      { run: 'r_8f2c', status: 'failed', retries: 2, tags: ['audit', null] },
      null,
      2,
    ),
  },
};

export const Diff: Story = {
  args: {
    language: 'diff',
    code: `--- a/src/runner.rs
+++ b/src/runner.rs
@@ -12,7 +12,7 @@ fn run() {
-    let timeout = 30;
+    let timeout = 120;
     execute(timeout);
 }`,
  },
};

export const UnknownLanguage: Story = {
  args: { language: 'klingon', code: '<script>alert(1)</script> & "quotes"' },
};

export const NoLanguage: Story = { args: { language: undefined, code: 'plain text, no grammar' } };

export const LongLine: Story = {
  args: {
    language: 'bash',
    code: `curl -X POST https://api.example.com/v1/runs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"agent":"auditor","repo":"FerrLabs/UI","ref":"refs/heads/main","timeout_seconds":600}'`,
  },
  decorators: [
    (story) => ({ ...story(), template: `<div style="max-width:420px">${story().template}</div>` }),
  ],
};
