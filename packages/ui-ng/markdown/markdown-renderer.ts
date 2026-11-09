import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { escapeHtml } from './escape-html';
import { highlightCode } from './highlight';

const EXTERNAL_URL = /^[a-z][a-z0-9+.-]*:\/\//i;

const marked = new Marked(
  markedHighlight({
    langPrefix: 'language-',
    highlight: (code, language) => highlightCode(code, language),
  }),
  {
    gfm: true,
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const targetAttr = EXTERNAL_URL.test(href) ? ' target="_blank"' : '';
        return `<a href="${escapeHtml(href)}"${titleAttr}${targetAttr} rel="noopener noreferrer">${text}</a>`;
      },
      checkbox({ checked }) {
        return checked
          ? '<span class="flr-md-task flr-md-task--done"><span class="flr-md-sr">Done: </span></span>'
          : '<span class="flr-md-task"><span class="flr-md-sr">Open: </span></span>';
      },
    },
  },
);

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}
