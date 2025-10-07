// Lightweight HTML sanitizer & normalizer tailored for AI HTML responses.
// Strips global styles / head / body, whitelists semantic tags, removes inline styles,
// and maps tags to Tailwind-friendly classes so they blend with site design.

const ALLOWED_TAGS = new Set([
  'p','br','strong','b','em','i','u','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','code','pre','a','hr','iframe'
]);

const BLOCK_TAGS = new Set(['p','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','pre']);

// Tailwind class mapping per tag - Spiritual Amber/Orange/Yellow Theme
const TAG_CLASS_MAP = {
  h1: 'text-3xl font-bold mt-6 mb-4 text-amber-800 align-middle',
  h2: 'text-2xl font-semibold mt-6 mb-3 text-amber-700',
  h3: 'text-xl font-semibold mt-5 mb-2 text-orange-700',
  h4: 'text-lg font-semibold mt-4 mb-2 text-orange-600',
  h5: 'text-base font-semibold mt-3 mb-2 text-yellow-700',
  h6: 'text-sm font-semibold mt-3 mb-2 text-yellow-600',
  p: 'my-3 text-slate-700 leading-relaxed',
  ul: 'list-disc pl-6 my-4 space-y-2 text-slate-700',
  ol: 'list-decimal pl-6 my-4 space-y-2 text-slate-700',
  li: 'text-slate-700 leading-relaxed',
  blockquote: 'border-l-4 border-amber-400 pl-4 italic my-4 text-amber-800 bg-amber-50/50 py-3 rounded-r shadow-sm',
  code: 'px-2 py-1 rounded bg-amber-100 text-amber-900 text-sm font-mono border border-amber-200',
  pre: 'bg-slate-900 text-amber-100 p-4 rounded-lg overflow-x-auto text-sm my-4 border border-amber-200',
  a: 'text-amber-600 underline break-words hover:text-orange-700 transition-colors font-medium',
  hr: 'my-8 border-amber-200',
  iframe: 'w-full rounded-lg my-6 aspect-video border-2 border-amber-200 shadow-lg'
};

// Escape HTML entities in text nodes
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
}

// Very small HTML tokenizer (not fully spec compliant, but fine for controlled input)
function tokenize(html) {
  const tokens = [];
  const regex = /<[^>]+>|[^<]+/g;
  let m;
  while ((m = regex.exec(html))) {
    tokens.push(m[0]);
  }
  return tokens;
}

// Parse & sanitize
export function sanitizeAIHtml(input) {
  if (!input || typeof input !== 'string') return '';

  // Remove DOCTYPE, head, style, script tags quickly
  let html = input.replace(/<!DOCTYPE[\s\S]*?>/gi, '')
                  .replace(/<head[\s\S]*?<\/head>/gi, '')
                  .replace(/<style[\s\S]*?<\/style>/gi, '')
                  .replace(/<script[\s\S]*?<\/script>/gi, '')
                  .replace(/<body[^>]*>/gi, '')
                  .replace(/<\/body>/gi, '')
                  .replace(/<html[^>]*>/gi, '')
                  .replace(/<\/html>/gi, '');

  const tokens = tokenize(html);
  const stack = [];
  let out = '';

  for (const raw of tokens) {
    if (raw.startsWith('<')) {
      const isEnd = /^<\//.test(raw);
      const isSelfClosing = /\/>$/.test(raw);
      const nameMatch = raw.match(/^<\/?\s*([a-zA-Z0-9]+)/);
      if (!nameMatch) continue;
      const tag = nameMatch[1].toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) {
        // Drop tag entirely
        continue;
      }

      if (isEnd) {
        // Pop until we find matching
        let idx = stack.lastIndexOf(tag);
        if (idx !== -1) {
          while (stack.length > idx) {
            const t = stack.pop();
            out += `</${t}>`;
            if (t === tag) break;
          }
        }
        continue;
      }

      // Build allowed attributes
      let attrs = '';
      if (tag === 'a') {
        const hrefMatch = raw.match(/href\s*=\s*"([^"]+)"/i) || raw.match(/href\s*=\s*'([^']+)'/i);
        if (hrefMatch) {
          let href = hrefMatch[1].trim();
          // Disallow javascript: etc
            if (/^(javascript:|data:)/i.test(href)) href = '#';
          attrs += ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
        }
      } else if (tag === 'iframe') {
        const srcMatch = raw.match(/src\s*=\s*"([^"]+)"/i) || raw.match(/src\s*=\s*'([^']+)'/i);
        if (srcMatch) {
          let src = srcMatch[1].trim();
          // Allow only youtube embeds for safety
          if (!/^(https:\/\/www\.youtube\.com\/embed\/|https:\/\/player\.vimeo\.com\/video\/)/.test(src)) {
            continue; // Drop iframe entirely if not allowed
          }
          attrs += ` src="${escapeHtml(src)}" title="Embedded content" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen`;
        } else {
          continue; // no src -> skip
        }
      }

      const cls = TAG_CLASS_MAP[tag];
      if (cls) attrs += ` class="${cls}"`;

      out += `<${tag}${attrs}>`;
      if (!isSelfClosing && tag !== 'br' && tag !== 'hr') {
        stack.push(tag);
      } else if (tag === 'br' || tag === 'hr') {
        // self-closing style
      }
    } else {
      // text node
      const text = raw.trimStart();
      if (!text) continue;
      out += escapeHtml(text);
    }
  }

  // Close any still-open tags
  while (stack.length) {
    out += `</${stack.pop()}>`;
  }

  // Normalize multiple blank lines
  out = out.replace(/(\n\s*){3,}/g, '\n\n');

  return out;
}

export default sanitizeAIHtml;
