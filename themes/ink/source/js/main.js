(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- theme toggle (cross-fade) ---------- */
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    let fadeTimer = 0;
    const syncToggleState = () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const label = isDark
        ? '当前为深色模式，切换到浅色模式'
        : '当前为浅色模式，切换到深色模式';
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
      toggle.setAttribute('aria-pressed', String(isDark));
    };
    const applyTheme = (next) => {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('ink-theme', next); } catch (e) {}
      const meta = document.getElementById('meta-theme-color');
      if (meta) meta.content = next === 'dark' ? '#141519' : '#f6f5f2';
      syncToggleState();
    };
    syncToggleState();
    if ('MutationObserver' in window) {
      new MutationObserver(syncToggleState).observe(root, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (reducedMotion.matches) {
        applyTheme(next);
      } else if (document.startViewTransition) {
        document.startViewTransition(() => applyTheme(next));
      } else {
        root.classList.add('theme-switching');
        applyTheme(next);
        window.clearTimeout(fadeTimer);
        fadeTimer = window.setTimeout(() => {
          root.classList.remove('theme-switching');
        }, 420);
      }
    });
  }

  const content = document.querySelector('.post-content');

  /* ---------- code blocks: language badge + copy button ---------- */
  if (content) {
    content.querySelectorAll('pre').forEach((pre) => {
      if (pre.closest('.callout')) return;
      const code = pre.querySelector('code');

      if (code) {
        const match = code.className.match(/(?:^|\s)(?:hljs|language-|lang-)\s*([a-zA-Z0-9+#-]+)/);
        let lang = match ? match[1].toLowerCase() : '';
        if (['text', 'plaintext', 'plain', 'hljs'].includes(lang)) lang = '';
        if (lang) pre.dataset.lang = lang;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy';
      button.setAttribute('aria-label', '复制代码');
      button.textContent = '复制';
      button.addEventListener('click', () => {
        const text = (code || pre).innerText.replace(/\n$/, '');
        const done = () => {
          button.textContent = '已复制';
          button.classList.add('is-copied');
          setTimeout(() => {
            button.textContent = '复制';
            button.classList.remove('is-copied');
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => {});
        }
      });
      pre.appendChild(button);
    });
  }

  /* ---------- Obsidian-style callouts ---------- */
  if (content) {
    const kinds = {
      abstract: '摘要', summary: '摘要', tldr: '摘要',
      note: '笔记', info: '信息',
      tip: '提示', hint: '提示',
      important: '重要',
      warning: '注意', caution: '注意', attention: '注意',
      danger: '警告', error: '警告',
      question: '问题', help: '问题',
      example: '示例',
      quote: '引用', cite: '引用',
      success: '完成', check: '完成', done: '完成'
    };
    content.querySelectorAll('blockquote').forEach((quote) => {
      const first = quote.querySelector('p');
      if (!first || !first.firstChild || first.firstChild.nodeType !== Node.TEXT_NODE) return;
      const match = first.firstChild.nodeValue.match(/^\s*\[!(\w+)\]([+-]?)\s*/);
      if (!match) return;
      const kind = match[1].toLowerCase();
      if (!(kind in kinds)) return;

      first.firstChild.nodeValue = first.firstChild.nodeValue.slice(match[0].length);
      if (first.firstChild.nodeValue === '' ) first.removeChild(first.firstChild);
      if (first.firstChild && first.firstChild.nodeName === 'BR') first.removeChild(first.firstChild);
      if (!first.hasChildNodes()) first.remove();

      quote.classList.add('callout', `callout-${kind}`);
      const title = document.createElement('p');
      title.className = 'callout-title';
      title.textContent = kinds[kind];
      quote.prepend(title);
    });
  }

  /* ---------- table of contents ---------- */
  const tocCard = document.querySelector('.post-toc .toc-card');
  if (tocCard) {
    const wide = window.matchMedia('(min-width: 1200px)');
    const syncToc = () => { tocCard.open = wide.matches; };
    syncToc();
    if (wide.addEventListener) wide.addEventListener('change', syncToc);

    if (content && 'IntersectionObserver' in window) {
      const links = new Map();
      tocCard.querySelectorAll('a.toc-link').forEach((link) => {
        try {
          const id = decodeURIComponent((link.getAttribute('href') || '').slice(1));
          if (id) links.set(id, link);
        } catch (e) {}
      });
      if (links.size) {
        let activeLink = null;
        const headings = [...content.querySelectorAll('h2[id], h3[id], h4[id]')]
          .filter((h) => links.has(h.id));
        const setActive = (id) => {
          const link = links.get(id);
          if (!link || link === activeLink) return;
          if (activeLink) activeLink.classList.remove('toc-active');
          link.classList.add('toc-active');
          activeLink = link;
        };
        const observer = new IntersectionObserver((entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length) setActive(visible[0].target.id);
        }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
        headings.forEach((heading) => observer.observe(heading));
      }
    }
  }

  /* ---------- archive year nav highlight ---------- */
  const archiveNav = document.querySelector('.archive-nav');
  if (archiveNav && 'IntersectionObserver' in window) {
    const links = new Map();
    archiveNav.querySelectorAll('a[href^="#"]').forEach((link) => {
      links.set((link.getAttribute('href') || '').slice(1), link);
    });
    if (links.size) {
      let activeLink = null;
      const setActive = (id) => {
        const link = links.get(id);
        if (!link || link === activeLink) return;
        if (activeLink) activeLink.classList.remove('is-active');
        link.classList.add('is-active');
        activeLink = link;
      };
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      }, { rootMargin: '-140px 0px -55% 0px', threshold: 0 });
      document.querySelectorAll('.archive-year[id]').forEach((section) => {
        observer.observe(section);
      });
    }
  }

  /* ---------- back to top ---------- */
  const backTop = document.querySelector('.back-top');
  if (backTop) {
    const sync = () => {
      const show = window.scrollY > 640;
      backTop.hidden = false;
      backTop.classList.toggle('is-visible', show);
    };
    window.addEventListener('scroll', sync, { passive: true });
    sync();
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
  }
})();
