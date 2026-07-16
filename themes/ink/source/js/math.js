/* Renders TeX in .post-content.
   Display math arrives as <p>$$<br>…<br>$$</p> (marked breaks:true), inline math as $…$.
   A conservative validator keeps prose like "$2" or "$1 和 $2" untouched. */
(() => {
  if (typeof katex === 'undefined') return;
  const scope = document.querySelector('.post-content');
  if (!scope) return;

  const render = (tex, el, display) => {
    try {
      katex.render(tex, el, { displayMode: display, throwOnError: false, strict: 'ignore' });
      return true;
    } catch (e) {
      return false;
    }
  };

  /* ---- display math: whole paragraphs fenced by $$ ---- */
  scope.querySelectorAll('p').forEach((p) => {
    if (p.querySelector('img, pre, .katex')) return;
    const text = p.textContent.trim();
    if (text.length < 5 || !text.startsWith('$$') || !text.endsWith('$$')) return;
    const tex = text.slice(2, -2).trim();
    if (!tex || tex.includes('$$')) return;
    const holder = document.createElement('div');
    holder.className = 'math-display';
    if (render(tex, holder, true)) p.replaceWith(holder);
  });

  /* ---- inline math: $…$ inside text nodes ---- */
  const looksLikeTex = (tex) => {
    if (/[一-鿿＀-￯]/.test(tex) && !tex.includes('\\')) return false;
    if (/[\\_^{}]/.test(tex)) return true;
    return /^[A-Za-z][A-Za-z0-9 =+\-*/<>,.()'|:!]*$/.test(tex) && tex.length <= 48;
  };

  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || node.nodeValue.indexOf('$') === -1) return NodeFilter.FILTER_REJECT;
      let el = node.parentElement;
      while (el && el !== scope) {
        const tag = el.tagName;
        if (tag === 'PRE' || tag === 'CODE' || tag === 'SCRIPT' || tag === 'STYLE' ||
            tag === 'TEXTAREA' || el.classList.contains('katex') ||
            el.classList.contains('math-display')) {
          return NodeFilter.FILTER_REJECT;
        }
        el = el.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  const pattern = /\$([^$\n]{1,300}?)\$/g;
  nodes.forEach((node) => {
    const text = node.nodeValue;
    pattern.lastIndex = 0;
    let match;
    let last = 0;
    let fragment = null;
    while ((match = pattern.exec(text))) {
      const tex = match[1].trim();
      if (!looksLikeTex(tex)) continue;
      const span = document.createElement('span');
      if (!render(tex, span, false)) continue;
      fragment = fragment || document.createDocumentFragment();
      fragment.appendChild(document.createTextNode(text.slice(last, match.index)));
      fragment.appendChild(span);
      last = match.index + match[0].length;
    }
    if (fragment) {
      fragment.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(fragment, node);
    }
  });
})();
