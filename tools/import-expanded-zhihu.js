#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const POSTS_DIR = path.resolve('source/_posts');

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function parseArguments() {
  const arguments_ = process.argv.slice(2);
  const dryRun = arguments_.includes('--dry-run');
  const htmlPath = arguments_.find((argument) => !argument.startsWith('--'));

  if (!htmlPath) {
    throw new Error(
      'Usage: node tools/import-expanded-zhihu.js <expanded-profile.html> [--dry-run]',
    );
  }

  return { htmlPath: path.resolve(htmlPath), dryRun };
}

function safeFilename(title) {
  const cleaned = title
    .replace(/[\\/:*?"<>|]/g, (character) =>
      character === ':' ? '：' : character === '/' || character === '\\' ? '／' : '',
    )
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[. ]+$/g, '')
    .trim();

  return cleaned || '未命名文章';
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function formatShanghaiDate(value) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
    .format(new Date(value))
    .replace(' ', ' ');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/!\[[^\]]*\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[`#>*_~\-[\](){}|\\/\s\p{P}\p{S}]/gu, '');
}

function shingles(value, size = 8) {
  const normalized = normalizeText(value);
  const result = new Set();
  for (let index = 0; index <= normalized.length - size; index += 1) {
    result.add(normalized.slice(index, index + size));
  }
  return result;
}

function diceCoefficient(left, right) {
  let intersection = 0;
  for (const item of left) {
    if (right.has(item)) {
      intersection += 1;
    }
  }
  return (2 * intersection) / (left.size + right.size || 1);
}

function readExistingPosts() {
  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const filePath = path.join(POSTS_DIR, entry.name);
      const markdown = fs.readFileSync(filePath, 'utf8');
      const body = markdown.replace(/^---[\s\S]*?---/, '');
      return {
        file: entry.name,
        path: filePath,
        body,
        shingles: shingles(body),
      };
    });
}

function findDuplicate(body, existingPosts) {
  const articleShingles = shingles(body);
  let best;

  for (const post of existingPosts) {
    const score = diceCoefficient(articleShingles, post.shingles);
    if (!best || score > best.score) {
      best = { score, post };
    }
  }

  return best?.score >= 0.75 ? best : undefined;
}

function createTurndownService() {
  const service = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
  });
  service.use(gfm);

  service.addRule('zhihuMath', {
    filter(node) {
      return (
        node.nodeType === 1 &&
        node.classList?.contains('ztext-math') &&
        node.hasAttribute('data-tex')
      );
    },
    replacement(_content, node) {
      const tex = node.getAttribute('data-tex').trim();
      return node.getAttribute('data-eeimg') === '2'
        ? `\n\n$$\n${tex}\n$$\n\n`
        : `$${tex}$`;
    },
  });

  return service;
}

function decodeZhihuRedirects(root) {
  for (const link of root.querySelectorAll('a[href]')) {
    try {
      const url = new URL(link.href);
      if (url.hostname === 'link.zhihu.com' && url.searchParams.has('target')) {
        link.href = decodeURIComponent(url.searchParams.get('target'));
      }
    } catch {
      // Keep malformed links as they appeared in the source document.
    }
  }
}

function removeExpandedContentDuplicate(root) {
  const headings = [...root.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4')];
  const headingCounts = new Map();
  for (const heading of headings) {
    const text = heading.textContent.trim();
    headingCounts.set(text, (headingCounts.get(text) || 0) + 1);
  }
  const repeatedHeadingCount = [...headingCounts.values()].filter(
    (count) => count > 1,
  ).length;
  if (repeatedHeadingCount < 4) return;

  const seen = new Set();
  const firstRepeatedHeading = headings.find((heading) => {
    const text = heading.textContent.trim();
    if (seen.has(text)) return true;
    seen.add(text);
    return false;
  });
  if (!firstRepeatedHeading) return;

  let duplicateStart = firstRepeatedHeading;
  if (duplicateStart.previousElementSibling?.tagName === 'BLOCKQUOTE') {
    duplicateStart = duplicateStart.previousElementSibling;
  }
  while (duplicateStart) {
    const next = duplicateStart.nextElementSibling;
    duplicateStart.remove();
    duplicateStart = next;
  }
}

function extensionFromBytes(buffer, contentType, source) {
  if (buffer.length >= 12) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8) return '.jpg';
    if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return '.png';
    if (buffer.subarray(0, 3).toString() === 'GIF') return '.gif';
    if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return '.webp';
  }
  if (/svg/i.test(contentType || '')) return '.svg';
  if (/png/i.test(contentType || '')) return '.png';
  if (/gif/i.test(contentType || '')) return '.gif';
  if (/webp/i.test(contentType || '')) return '.webp';
  if (/jpe?g/i.test(contentType || '')) return '.jpg';
  const extension = path.extname(new URL(source, 'https://www.zhihu.com').pathname).toLowerCase();
  return /^\.(?:jpe?g|png|gif|webp|svg)$/.test(extension) ? extension : '.jpg';
}

async function fetchImage(image, articleUrl, htmlDirectory) {
  const remoteSource =
    image.getAttribute('data-original') ||
    image.getAttribute('data-actualsrc') ||
    image.getAttribute('src');
  const localSource = image.getAttribute('src');

  if (remoteSource && /^https?:\/\//i.test(remoteSource)) {
    try {
      const response = await fetch(remoteSource, {
        headers: { 'user-agent': USER_AGENT, referer: articleUrl },
      });
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return {
          buffer,
          extension: extensionFromBytes(
            buffer,
            response.headers.get('content-type'),
            remoteSource,
          ),
          key: remoteSource.replace(/\?.*$/, ''),
        };
      }
    } catch {
      // Fall through to the browser-saved resource.
    }
  }

  if (localSource && !/^https?:\/\//i.test(localSource)) {
    const localPath = path.resolve(htmlDirectory, localSource);
    const buffer = await fsp.readFile(localPath);
    return {
      buffer,
      extension: extensionFromBytes(buffer, '', localPath),
      key: remoteSource || localPath,
    };
  }

  throw new Error(`Unable to obtain image: ${remoteSource || '(missing source)'}`);
}

async function localizeImages(root, article, assetDirectory, htmlDirectory, dryRun) {
  for (const noscript of root.querySelectorAll('noscript')) {
    noscript.remove();
  }

  const images = [...root.querySelectorAll('img')];
  const localized = new Map();
  let imageIndex = 0;
  const failures = [];

  for (const image of images) {
    imageIndex += 1;
    try {
      const result = await fetchImage(image, article.url, htmlDirectory);
      let filename = localized.get(result.key);
      if (!filename) {
        filename = `${article.id}-${String(imageIndex).padStart(2, '0')}${result.extension}`;
        localized.set(result.key, filename);
        if (!dryRun) {
          await fsp.mkdir(assetDirectory, { recursive: true });
          await fsp.writeFile(path.join(assetDirectory, filename), result.buffer);
        }
        await sleep(120);
      }
      image.setAttribute('src', filename);
      image.setAttribute(
        'alt',
        image.getAttribute('data-caption') || image.getAttribute('alt') || '',
      );
      for (const attribute of [
        'data-original',
        'data-actualsrc',
        'srcset',
        'class',
        'style',
        'width',
        'height',
      ]) {
        image.removeAttribute(attribute);
      }
    } catch (error) {
      failures.push(error.message);
    }
  }

  return { count: localized.size, failures };
}

function cleanMarkdown(markdown) {
  return markdown
    .replaceAll('\u200b', '')
    .replaceAll('\u2060', '')
    .replace(/^> > (.+) >$/gm, '> $1')
    .replace(/^> \\\[!(\w+)\\\]/gm, '> [!$1]')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s+|\s+$/g, '')
    .concat('\n');
}

function frontMatter(article, hasMath) {
  const lines = [
    '---',
    `title: ${yamlString(article.title)}`,
    `date: ${formatShanghaiDate(article.published)}`,
    `updated: ${formatShanghaiDate(article.modified || article.published)}`,
    `zhihu_url: ${yamlString(article.url)}`,
    `zhihu_id: ${yamlString(article.id)}`,
  ];
  if (hasMath) lines.push('math: true');
  lines.push('---', '');
  return lines.join('\n');
}

async function main() {
  const { htmlPath, dryRun } = parseArguments();
  const html = await fsp.readFile(htmlPath, 'utf8');
  const document = new JSDOM(html).window.document;
  const items = [...document.querySelectorAll('.ArticleItem')];
  const collapsed = items.filter(
    (item) =>
      item.querySelector('.RichContent')?.classList.contains('is-collapsed') ||
      item.querySelector('button.ContentItem-more'),
  );

  if (!items.length) throw new Error('No Zhihu articles were found');
  if (collapsed.length) {
    throw new Error(`${collapsed.length} articles are still collapsed`);
  }

  const existingPosts = readExistingPosts();
  const htmlDirectory = path.dirname(htmlPath);
  const turndown = createTurndownService();
  const report = { created: [], duplicates: [], skipped: [], imageFailures: [] };

  for (const [index, item] of items.entries()) {
    const titleLink = item.querySelector(
      '.ContentItem-title a[href*="zhuanlan.zhihu.com/p/"]',
    );
    const body = item.querySelector('[itemprop="articleBody"]');
    const article = {
      id: titleLink?.href.match(/\/p\/(\d+)/)?.[1],
      title: titleLink?.textContent.trim(),
      url: titleLink?.href,
      published: item.querySelector('meta[itemprop="datePublished"]')?.content,
      modified: item.querySelector('meta[itemprop="dateModified"]')?.content,
    };
    if (!article.id || !article.title || !body || !article.published) {
      report.skipped.push({ index: index + 1, title: article.title, reason: 'missing metadata' });
      continue;
    }

    const duplicate = findDuplicate(body.textContent, existingPosts);
    if (duplicate) {
      report.duplicates.push({
        title: article.title,
        zhihuId: article.id,
        existingFile: duplicate.post.file,
        similarity: Number(duplicate.score.toFixed(3)),
      });
      continue;
    }

    const baseName = safeFilename(article.title);
    const markdownPath = path.join(POSTS_DIR, `${baseName}.md`);
    const assetDirectory = path.join(POSTS_DIR, baseName);
    if (fs.existsSync(markdownPath) || fs.existsSync(assetDirectory)) {
      report.skipped.push({ title: article.title, reason: 'target path already exists' });
      continue;
    }

    const root = body.cloneNode(true);
    removeExpandedContentDuplicate(root);
    const hasMath = Boolean(root.querySelector('.ztext-math[data-tex]'));
    decodeZhihuRedirects(root);
    const imageResult = await localizeImages(
      root,
      article,
      assetDirectory,
      htmlDirectory,
      dryRun,
    );
    const markdown = cleanMarkdown(turndown.turndown(root.innerHTML));

    if (!dryRun) {
      await fsp.writeFile(
        markdownPath,
        `${frontMatter(article, hasMath)}${markdown}`,
      );
    }

    report.created.push({
      title: article.title,
      zhihuId: article.id,
      file: path.relative(process.cwd(), markdownPath),
      images: imageResult.count,
      characters: body.textContent.trim().length,
    });
    for (const failure of imageResult.failures) {
      report.imageFailures.push({ title: article.title, failure });
    }
    console.log(
      `${dryRun ? 'Would create' : 'Created'} ${report.created.length}: ${article.title}`,
    );
  }

  const reportPath = '/tmp/zhihu-import-report.json';
  await fsp.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(
    `Summary: ${report.created.length} created, ${report.duplicates.length} duplicates, ${report.skipped.length} skipped, ${report.imageFailures.length} image failures`,
  );
  console.log(`Report: ${reportPath}`);

  if (report.imageFailures.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
