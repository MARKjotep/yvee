import { escapeHTML } from './escape.dom';

/** Attribute definitions and CSS/code are application-authored; values may be untrusted. */
export function validateAttribute(name: string, value: unknown): void {
  if (!/^[A-Za-z_:][A-Za-z0-9:._-]*$/.test(name)) {
    throw new TypeError(`Invalid attribute name: ${name}`);
  }
  const key = name.toLowerCase();
  if (key.startsWith('on') || key === 'srcdoc') {
    throw new TypeError(`Executable attribute is not supported: ${name}`);
  }
  if (value === false || value == null) return;
  const text = String(value);
  if (key === 'srcset' || key === 'imagesrcset') {
    // Data URLs contain commas; keep this list contract deliberately limited.
    if (/data:/i.test(text)) throw new TypeError('Data URLs are not supported in srcset.');
    for (const candidate of text.split(',')) validateURL(candidate.trim().split(/\s+/)[0] ?? '', key);
  } else if (['href', 'src', 'action', 'formaction', 'poster', 'cite', 'background', 'xlink:href', 'data'].includes(key)) {
    validateURL(text, key);
  }
}

function validateURL(value: string, attribute: string) {
  // Browsers ignore ASCII controls in schemes. Normalize before checking.
  const normalized = value.replace(/[\u0000-\u0020\u007f]/g, '');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(normalized)?.[1]?.toLowerCase();
  if (!scheme || ['http', 'https'].includes(scheme)) return;
  if ((attribute === 'href' || attribute === 'xlink:href') && ['mailto', 'tel'].includes(scheme)) return;
  if (attribute === 'src' && /^data:image\/(?:png|gif|jpeg|webp|avif);base64,[a-z0-9+/=]*$/i.test(normalized)) return;
  throw new TypeError(`Unsupported URL scheme in ${attribute}: ${scheme}`);
}

/** Inline code/CSS is trusted, but must never terminate its HTML container. */
export function inlineContent(tag: 'script' | 'style', value: unknown): string {
  const text = String(value ?? '');
  if (new RegExp(`</${tag}(?:[\\t\\n\\f\\r />]|$)`, 'i').test(text) || (tag === 'script' && /<!--|<script[\t\n\f\r />]/i.test(text))) {
    throw new TypeError(`Unsafe inline ${tag} content; use an external file or serializePayload for JSON.`);
  }
  return text;
}

/** JSON data only: rejects undefined roots, cycles and unsupported JSON values. */
export function serializePayload(value: unknown): string {
  const json = JSON.stringify(value, (_key, item: unknown) => {
    if (typeof item === 'bigint' || typeof item === 'function' || typeof item === 'symbol' || item === undefined || (typeof item === 'number' && !Number.isFinite(item))) {
      throw new TypeError('Bootstrap payload must contain JSON-serializable values.');
    }
    return item;
  });
  if (json === undefined) throw new TypeError('Bootstrap payload must be JSON-serializable.');
  return json.replace(/[<>&\u2028\u2029]/g, char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

export function renderJSONScript(value: unknown, options: { id: string; nonce?: string }): string {
  return `<script type="application/json" id="${escapeHTML(options.id)}"${options.nonce === undefined ? '' : ` nonce="${escapeHTML(options.nonce)}"`}>${serializePayload(value)}</script>`;
}
