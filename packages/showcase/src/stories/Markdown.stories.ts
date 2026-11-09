import { MarkdownComponent } from '@ferrlabs/ui-ng/markdown';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const AUDIT_REPORT = `# Security audit: FerrLabs/UI

Reviewed **12 files** across \`packages/ui-ng\` and ~~skipped~~ completed the follow-up. See the [checklist](https://example.com/checklist) for context.

## Findings

| Severity | Area | Status |
| :------- | :--- | -----: |
| high | \`innerHTML\` binding | open |
| medium | clipboard access | fixed |
| low | missing \`rel\` on links | fixed |

## Follow-ups

- [x] Sanitize rendered markdown
- [ ] Add a CSP to the showcase
- [ ] Review the \`docs\` entry point

> Run \`pnpm audit\` before every release.

## Evidence

\`\`\`rust
fn verify(token: &str) -> Result<Claims, AuthError> {
    let key = DecodingKey::from_secret(SECRET);
    decode::<Claims>(token, &key, &Validation::default()).map(|data| data.claims)
}
\`\`\`

\`\`\`json
{ "severity": "high", "count": 3, "fixed": false }
\`\`\`

\`\`\`diff
-element.innerHTML = html;
+element.textContent = text;
\`\`\`

## Hostile input (must render inert)

<img src="x" onerror="alert('img onerror')">

<script>alert('script')</script>

[bad link](javascript:alert('link'))
`;

const meta: Meta<MarkdownComponent> = {
  title: 'Content/Markdown',
  component: MarkdownComponent,
  decorators: [moduleMetadata({ imports: [MarkdownComponent] })],
  render: (args) => ({ props: args, template: `<flr-markdown [source]="source" />` }),
  args: { source: AUDIT_REPORT },
};

export default meta;
type Story = StoryObj<MarkdownComponent>;

export const AuditReport: Story = {};

export const Sanitizing: Story = {
  args: {
    source: `before <img src="x" onerror="alert(1)"> <script>alert(2)</script> <a href="javascript:alert(3)">link</a> after`,
  },
};

export const Narrow: Story = {
  decorators: [
    (story) => ({ ...story(), template: `<div style="max-width:360px">${story().template}</div>` }),
  ],
};
