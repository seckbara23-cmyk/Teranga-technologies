// Tiny HTML templating for the site generator: every interpolated value is escaped
// unless it is already markup produced by html`` or raw().

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESC[c]);
}

class Markup {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

export const raw = (s) => new Markup(String(s));

function render(v) {
  if (v == null || v === false || v === true) return '';
  if (Array.isArray(v)) return v.map(render).join('');
  if (v instanceof Markup) return v.s;
  return esc(v);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new Markup(out);
}

/**
 * Inline rich text for authored content: escapes everything, then allows
 * **bold** and [label](/path) links. Nothing else is interpreted.
 */
export function rich(text) {
  const s = esc(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
      const external = /^https?:/.test(href);
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
    });
  return new Markup(s);
}
