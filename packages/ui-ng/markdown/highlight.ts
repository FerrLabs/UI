import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-docker';
import { escapeHtml } from './escape-html';

const ALIASES: Readonly<Record<string, string>> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  rs: 'rust',
  py: 'python',
  yml: 'yaml',
  md: 'markdown',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  golang: 'go',
  dockerfile: 'docker',
};

function resolveLanguage(language: string | undefined): string | null {
  const name = language?.trim().toLowerCase();
  if (!name) return null;
  const resolved = ALIASES[name] ?? name;
  const grammar: unknown = Object.hasOwn(Prism.languages, resolved)
    ? Prism.languages[resolved]
    : undefined;
  return typeof grammar === 'object' && grammar !== null ? resolved : null;
}

export function highlightCode(code: string, language: string | undefined): string {
  const resolved = resolveLanguage(language);
  const grammar = resolved ? Prism.languages[resolved] : undefined;
  if (!resolved || !grammar) return escapeHtml(code);
  try {
    return Prism.highlight(code, grammar, resolved);
  } catch {
    return escapeHtml(code);
  }
}
